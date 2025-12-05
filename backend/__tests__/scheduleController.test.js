const scheduleController = require("../controllers/scheduleController");

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  find: jest.fn(() => ({ select: jest.fn(() => ({ lean: jest.fn() })) }))
}));

jest.mock("../models/ScheduleEntry", () => ({
  find: jest.fn(() => ({ populate: jest.fn(() => ({ sort: jest.fn(() => ({ lean: jest.fn() })) })) })),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(() => ({ lean: jest.fn() })),
  findByIdAndDelete: jest.fn()
}));

jest.mock("../models/Robot", () => ({
  find: jest.fn(() => ({ select: jest.fn(() => ({ lean: jest.fn() })) }))
}));

jest.mock("../utils/notify", () => ({
  createNotification: jest.fn()
}));

const User = require("../models/User");
const ScheduleEntry = require("../models/ScheduleEntry");
const Robot = require("../models/Robot");
const { createNotification } = require("../utils/notify");

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code; return this;
    },
    json(payload) {
      this.body = payload; return this;
    }
  };
}

function mockReq({ headers = {}, query = {}, body = {}, params = {}, user = null, ioMock = {} } = {}) {
  const app = { get: jest.fn(() => ioMock) };
  return { headers, query, body, params, app, user };
}

// Helper to reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
});


describe("requireJudgeOrAdmin", () => {
  test("Should return 401 when x-username header is missing", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await scheduleController.requireJudgeOrAdmin(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Brak nagłówka x-username" });
    expect(next).not.toHaveBeenCalled();
  });

  test("Should return 403 when user role is neither judge nor admin", async () => {
    const req = mockReq({ headers: { "x-username": "john" } });
    const res = mockRes();
    const next = jest.fn();

    User.findOne.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce({ username: "john", role: "user" }) });

    await scheduleController.requireJudgeOrAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Tylko sędzia lub admin" });
    expect(next).not.toHaveBeenCalled();
  });

  test("Should call next and attach user when role is judge", async () => {
    const req = mockReq({ headers: { "x-username": "jane" } });
    const res = mockRes();
    const next = jest.fn();

    User.findOne.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce({ _id: "u1", username: "jane", role: "judge" }) });

    await scheduleController.requireJudgeOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ _id: "u1", username: "jane", role: "judge" });
  });
});


describe("getSchedule", () => {
  test("Should build filter with date range and category and return list", async () => {
    const req = mockReq({ query: { categoryId: "c1", from: "2024-01-01", to: "2024-01-31" } });
    const res = mockRes();

    const leanMock = jest.fn().mockResolvedValueOnce([{ _id: "e1" }]);
    const sortMock = jest.fn(() => ({ lean: leanMock }));
    const populateMock = jest.fn(() => ({ sort: sortMock }));
    ScheduleEntry.find.mockReturnValueOnce({ populate: populateMock });

    await scheduleController.getSchedule(req, res);

    expect(ScheduleEntry.find).toHaveBeenCalledWith({
      category: "c1",
      startTime: { $gte: new Date("2024-01-01"), $lte: new Date("2024-01-31") }
    });
    expect(populateMock).toHaveBeenCalledWith("category", "name");
    expect(sortMock).toHaveBeenCalledWith({ startTime: 1 });
    expect(res.body).toEqual({ schedule: [{ _id: "e1" }] });
  });
});


describe("createSchedule", () => {
  test("Should validate required fields", async () => {
    const req = mockReq({ body: { title: "", startTime: null, endTime: null } });
    const res = mockRes();

    await scheduleController.createSchedule(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Brak wymaganych pól" });
  });

  test("Should create and notify with category and location", async () => {
    const req = mockReq({
      body: { title: "Match", categoryId: "cat1", location: "A1", startTime: "2024-01-02T10:00:00Z", endTime: "2024-01-02T11:00:00Z" },
      user: { _id: "u1" },
      ioMock: {}
    });
    const res = mockRes();

    const entry = { _id: "e1", title: "Match", category: "cat1", startTime: new Date("2024-01-02T10:00:00Z"), endTime: new Date("2024-01-02T11:00:00Z") };
    ScheduleEntry.create.mockResolvedValueOnce(entry);

    const robotsLean = jest.fn().mockResolvedValueOnce([{ team: "t1" }]);
    Robot.find.mockReturnValueOnce({ select: jest.fn(() => ({ lean: robotsLean })) });

    const usersLean = jest.fn().mockResolvedValueOnce([{ _id: "u2" }, { _id: "u3" }]);
    User.find.mockReturnValueOnce({ select: jest.fn(() => ({ lean: usersLean })) });

    createNotification.mockResolvedValue();

    await scheduleController.createSchedule(req, res);

    expect(ScheduleEntry.create).toHaveBeenCalledWith({
      title: "Match",
      category: "cat1",
      location: "A1",
      startTime: new Date("2024-01-02T10:00:00Z"),
      endTime: new Date("2024-01-02T11:00:00Z"),
      createdBy: "u1"
    });

    expect(createNotification).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(201);
    expect(res.body.entry).toEqual(entry);
  });
});


describe("updateSchedule", () => {
  test("Should return 404 when entry not found", async () => {
    const req = mockReq({ params: { id: "eX" }, body: { title: "New" }, ioMock: {} });
    const res = mockRes();

    ScheduleEntry.findByIdAndUpdate.mockResolvedValueOnce(null);

    await scheduleController.updateSchedule(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Nie znaleziono wydarzenia" });
  });

  test("Should update fields and notify", async () => {
    const req = mockReq({ params: { id: "e1" }, body: { title: "New", location: "B2" }, ioMock: {} });
    const res = mockRes();

    const updated = { _id: "e1", title: "New", location: "B2" };
    ScheduleEntry.findByIdAndUpdate.mockResolvedValueOnce(updated);

    const robotsLean = jest.fn().mockResolvedValueOnce([]);
    Robot.find.mockReturnValueOnce({ select: jest.fn(() => ({ lean: robotsLean })) });

    const usersLean = jest.fn().mockResolvedValueOnce([{ _id: "u1" }]);
    User.find.mockReturnValueOnce({ select: jest.fn(() => ({ lean: usersLean })) });

    await scheduleController.updateSchedule(req, res);

    expect(ScheduleEntry.findByIdAndUpdate).toHaveBeenCalledWith("e1", { title: "New", location: "B2" }, { new: true });
    expect(createNotification).toHaveBeenCalledTimes(1);
    expect(res.body.entry).toEqual(updated);
  });
});


describe("deleteSchedule", () => {
  test("Should notify on delete when entry exists", async () => {
    const req = mockReq({ params: { id: "e1" }, ioMock: {} });
    const res = mockRes();

    const entry = { _id: "e1", title: "Old" };
    const lean = jest.fn().mockResolvedValueOnce(entry);
    ScheduleEntry.findById.mockReturnValueOnce({ lean });

    ScheduleEntry.findByIdAndDelete.mockResolvedValueOnce({});

    const robotsLean = jest.fn().mockResolvedValueOnce([]);
    Robot.find.mockReturnValueOnce({ select: jest.fn(() => ({ lean: robotsLean })) });

    const usersLean = jest.fn().mockResolvedValueOnce([{ _id: "u1" }, { _id: "u2" }]);
    User.find.mockReturnValueOnce({ select: jest.fn(() => ({ lean: usersLean })) });

    await scheduleController.deleteSchedule(req, res);

    expect(createNotification).toHaveBeenCalledTimes(2);
    expect(res.body).toEqual({ message: "Usunięto wydarzenie" });
  });

  test("Should succeed without notify when entry not found", async () => {
    const req = mockReq({ params: { id: "eX" }, ioMock: {} });
    const res = mockRes();

    const lean = jest.fn().mockResolvedValueOnce(null);
    ScheduleEntry.findById.mockReturnValueOnce({ lean });
    ScheduleEntry.findByIdAndDelete.mockResolvedValueOnce({});

    await scheduleController.deleteSchedule(req, res);

    expect(createNotification).not.toHaveBeenCalled();
    expect(res.body).toEqual({ message: "Usunięto wydarzenie" });
  });
});
