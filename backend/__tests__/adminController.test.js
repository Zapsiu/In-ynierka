jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  updateMany: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn()
}));

jest.mock("../models/Team", () => ({
  findById: jest.fn(),
  updateOne: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock("../models/Settings", () => {
  const Ctor = jest.fn(function (init) {
    Object.assign(this, init);
    this.save = jest.fn().mockResolvedValue();
  });
  Ctor.findOne = jest.fn();
  Ctor.create = jest.fn();
  return Ctor;
});

jest.mock("../models/Robot", () => ({
  updateMany: jest.fn(),
  deleteMany: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock("../models/Category", () => ({
  findByIdAndDelete: jest.fn()
}));

jest.mock("../utils/notify", () => ({ createNotification: jest.fn() }));

const admin = require("../controllers/adminController");
const User = require("../models/User");
const Team = require("../models/Team");
const Settings = require("../models/Settings");
const Robot = require("../models/Robot");
const Category = require("../models/Category");
const { createNotification } = require("../utils/notify");

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}
function mockReq({ body = {}, params = {}, io = {} } = {}) { return { body, params, app: { get: () => io } }; }

beforeEach(() => jest.clearAllMocks());


describe("updateUserRole", () => {
  test("Should reject invalid role and 404 when user missing", async () => {
    const res1 = mockRes();
    await admin.updateUserRole(mockReq({ body: { username: "u", newRole: "x" } }), res1);
    expect(res1.statusCode).toBe(400);

    const res2 = mockRes();
    User.findOne.mockResolvedValueOnce(null);
    await admin.updateUserRole(mockReq({ body: { username: "u", newRole: "admin" } }), res2);
    expect(res2.statusCode).toBe(404);
  });

  test("Should update role and save", async () => {
    const user = { username: "u", role: "user", save: jest.fn().mockResolvedValue() };
    User.findOne.mockResolvedValueOnce(user);
    const res = mockRes();
    await admin.updateUserRole(mockReq({ body: { username: "u", newRole: "judge" } }), res);
    expect(user.save).toHaveBeenCalled();
    expect(res.body.message).toMatch("Rola użytkownika u zmieniona na judge");
  });
});


describe("updateTeamLimit", () => {
  test("Should validate input and update team limit", async () => {
    const res1 = mockRes();
    await admin.updateTeamLimit(mockReq({ body: { teamId: "t1", newLimit: 0 } }), res1);
    expect(res1.statusCode).toBe(400);

    const teamDoc = { _id: "t1", teamName: "A", save: jest.fn().mockResolvedValue() };
    Team.findById.mockResolvedValueOnce(teamDoc);
    const res2 = mockRes();
    await admin.updateTeamLimit(mockReq({ body: { teamId: "t1", newLimit: 5 } }), res2);
    expect(teamDoc.save).toHaveBeenCalled();
    expect(res2.body.message).toBe('Limit drużyny "A" ustawiony na 5');
  });
});


describe("getDefaultTeamLimit / setDefaultTeamLimit", () => {
  test("Should create default when missing and set new limit", async () => {
    Settings.findOne.mockResolvedValueOnce(null);
    Settings.create.mockResolvedValueOnce({ defaultTeamLimit: 5 });

    const res1 = mockRes();
    await admin.getDefaultTeamLimit({}, res1);
    expect(res1.body.limit).toBe(5);

    const settingsDoc = { defaultTeamLimit: 5, save: jest.fn().mockResolvedValue() };
    Settings.findOne.mockResolvedValueOnce(settingsDoc);
    const res2 = mockRes();
    await admin.setDefaultTeamLimit(mockReq({ body: { limit: 3 } }), res2);
    expect(settingsDoc.save).toHaveBeenCalled();
    expect(res2.body.message).toBe("Zapisano nowy domyślny limit");

    Settings.findOne.mockResolvedValueOnce(null);
    const newInstanceSave = jest.fn().mockResolvedValue();
    Settings.mockImplementationOnce(function (init) { Object.assign(this, init); this.save = newInstanceSave; });
    const res3 = mockRes();
    await admin.setDefaultTeamLimit(mockReq({ body: { limit: 4 } }), res3);
    expect(newInstanceSave).toHaveBeenCalled();
    expect(res3.body.message).toBe("Zapisano nowy domyślny limit");
  });
});


describe("removeMemberFromTeam", () => {
  test("Should remove member and notify", async () => {
    const user = { _id: "u1" };
    const teamDoc = { _id: "t1", teamName: "X", members: ["u1"], save: jest.fn().mockResolvedValue() };
    User.findOne.mockResolvedValueOnce(user);
    Team.findById.mockResolvedValueOnce(teamDoc);

    const res = mockRes();
    await admin.removeMemberFromTeam(mockReq({ body: { teamId: "t1", username: "john" } }), res);

    expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: user._id,
      type: "team_member_removed",
      meta: { teamId: teamDoc._id }
    }));
    expect(res.body.message).toMatch("Usunięto");
  });
});


describe("deleteRobot / deleteCategory / deleteTeam / deleteUser", () => {
  test("Should call model operations", async () => {
    const res1 = mockRes();
    await admin.deleteRobot({ params: { robotId: "r1" } }, res1);
    expect(res1.body.message).toBe("Robot usunięty");

    const res2 = mockRes();
    await admin.deleteCategory({ params: { categoryId: "c1" } }, res2);
    expect(res2.body.message).toBe("Kategoria usunięta");

    const res3 = mockRes();
    await admin.deleteTeam({ params: { teamId: "t1" } }, res3);
    expect(res3.body.message).toBe("Drużyna usunięta wraz z robotami");

    const res4 = mockRes();
    User.findOne.mockResolvedValueOnce({ _id: "u1", team: "t1" });
    await admin.deleteUser({ params: { username: "john" } }, res4);
    expect(res4.body.message).toMatch("został usunięty");
  });
});
