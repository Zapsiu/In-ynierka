jest.mock("../models/Group", () => ({
  find: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../models/Playoff", () => ({
  deleteMany: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../models/Robot", () => ({
  find: jest.fn()
}));

jest.mock("../models/User", () => ({
  find: jest.fn()
}));

jest.mock("../utils/notify", () => ({ createNotification: jest.fn() }));

const playoff = require("../controllers/playoffController");
const Group = require("../models/Group");
const Playoff = require("../models/Playoff");
const Robot = require("../models/Robot");
const User = require("../models/User");
const { createNotification } = require("../utils/notify");

function mockRes(){ return { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(p){ this.body=p; return this; } }; }
function mockReq({ body = {}, query = {}, io = {} } = {}){ return { body, query, app: { get: () => io } }; }

beforeEach(() => jest.clearAllMocks());

function chainPopulateLean(value) {
  const ch = { populate: jest.fn(() => ch), lean: jest.fn().mockResolvedValue(value) };
  return ch;
}
function chainFindPopulateLean(value) {
  const lean = jest.fn().mockResolvedValue(value);
  const ch = { populate: jest.fn(() => ch), lean };
  return ch;
}
function chainSelectLean(value) {
  return { select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(value) })) };
}


describe("generatePlayoff", () => {
  test("Should reject when not enough robots and then generate bracket and notify", async () => {
    Group.find.mockReturnValueOnce(chainFindPopulateLean([]));

    const res1 = mockRes();
    await playoff.generatePlayoff(mockReq({ body: { categoryId: "c1" } }), res1);
    expect(res1.statusCode).toBe(400);

    const groups = [{ scores: [{ robot: { _id: "r1" }, points: 3 }, { robot: { _id: "r2" }, points: 1 }] }];
    Group.find.mockReturnValueOnce(chainFindPopulateLean(groups));

    Playoff.deleteMany.mockResolvedValueOnce();
    Playoff.create.mockResolvedValueOnce({ _id: "p1" });

    Playoff.findById.mockReturnValueOnce(chainPopulateLean({ _id: "p1" }));

    Robot.find.mockReturnValueOnce(chainSelectLean([{ team: "t1" }, { team: "t2" }]));
    User.find.mockReturnValueOnce(chainSelectLean([{ _id: "u1" }]));

    const res2 = mockRes();
    await playoff.generatePlayoff(mockReq({ body: { categoryId: "c1", size: 2 } }), res2);
    expect(createNotification).toHaveBeenCalled();
    expect(res2.statusCode).toBe(201);
    expect(res2.body.playoff).toBeDefined();
  });
});


describe("updateMatch", () => {
  test("Should validate inputs and compute bracket", async () => {
    const res1 = mockRes();
    await playoff.updateMatch({ params: { id: "p1" }, body: { round: "bad", index: 0, winner: "a" } }, res1);
    expect(res1.statusCode).toBe(400);

    const pdoc = { round1: [{ a: "r1", b: "r2", winner: null }], save: jest.fn().mockResolvedValue() };
    Playoff.findById.mockResolvedValueOnce(pdoc);

    Playoff.findById.mockReturnValueOnce(chainPopulateLean({ _id: "p1", round1: [{ a: "r1", b: "r2", winner: "a" }] }));

    const res2 = mockRes();
    await playoff.updateMatch({ params: { id: "p1" }, body: { round: "round1", index: 0, winner: "a" } }, res2);
    expect(pdoc.save).toHaveBeenCalled();
    expect(res2.body.playoff).toBeDefined();
  });
});


describe("getCurrentPlayoff", () => {
  test("Should return last playoff", async () => {
    const lean = jest.fn().mockResolvedValueOnce({ _id: "p1" });
    const populateChain = () => ({ populate: jest.fn(populateChain), lean });
    const sort = jest.fn(() => ({ populate: jest.fn(populateChain) }));
    Playoff.findOne.mockReturnValueOnce({ sort });

    const res = mockRes();
    await playoff.getCurrentPlayoff({ query: { categoryId: "c1" } }, res);
    expect(res.body.playoff).toEqual({ _id: "p1" });
  });
});
