const groups = require("../controllers/groupsController");

jest.mock("../models/Group", () => ({
  find: jest.fn(),
  deleteMany: jest.fn(),
  insertMany: jest.fn(),
  findById: jest.fn()
}));

jest.mock("../models/Robot", () => ({
  find: jest.fn()
}));

jest.mock("../models/User", () => ({
  find: jest.fn()
}));

jest.mock("../utils/notify", () => ({ createNotification: jest.fn() }));

const Group = require("../models/Group");
const Robot = require("../models/Robot");
const User = require("../models/User");

function mockRes(){ return { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(p){ this.body=p; return this; } }; }
function mockReq({ query = {}, body = {}, io = {} } = {}){ return { query, body, app: { get: () => io } }; }

beforeEach(() => jest.clearAllMocks());


describe("listGroups", () => {
  test("Should call find with optional category filter and return groups", async () => {
    const lean = jest.fn().mockResolvedValueOnce([{ _id: "g1" }]);
    const populate = jest.fn(() => ({ populate, lean }));
    Group.find.mockReturnValueOnce({ populate });
    const res = mockRes();
    await groups.listGroups(mockReq({ query: { categoryId: "c1" } }), res);
    expect(res.body).toEqual({ groups: [{ _id: "g1" }] });
  });
});


describe("generateGroups", () => {
  function chainSelectLean(value) {
    const lean = jest.fn().mockResolvedValueOnce(value);
    const select = jest.fn(() => ({ lean }));
    return { select };
  }

  test("Should build pool from category and notify", async () => {
    Robot.find.mockReturnValueOnce(
      chainSelectLean([{ _id: "r1" }, { _id: "r2" }])
    );

    Group.deleteMany.mockResolvedValueOnce();
    Group.insertMany.mockResolvedValueOnce();

    Robot.find.mockReturnValueOnce(
      chainSelectLean([{ team: "t1" }, { team: "t2" }])
    );

    User.find.mockReturnValueOnce(
      chainSelectLean([{ _id: "u1" }])
    );

    const leanGroups = jest.fn().mockResolvedValueOnce([{ _id: "g1" }]);
    const populate = jest.fn(() => ({ populate, lean: leanGroups }));
    Group.find.mockReturnValueOnce({ populate });

    const res = mockRes();
    await groups.generateGroups(
      mockReq({ body: { categoryId: "c", groupsCount: 2 } }),
      res
    );
  });
});


describe("updateScore", () => {
  test("Should validate inputs and update/compute table", async () => {
    const res1 = mockRes();
    await groups.updateScore({ params: { id: "g1" }, body: {} }, res1);
    expect(res1.statusCode).toBe(400);

    const g = { _id: "g1", members: ["r1"], scores: [{ robot: "r1", points: 0, played: 0, wins: 0, draws: 0, losses: 0 }], save: jest.fn() };
    Group.findById.mockResolvedValueOnce(g);

    const lean = jest.fn().mockResolvedValueOnce({ _id: "g1" });
    const populate = jest.fn(() => ({ populate, lean }));
    Group.findById.mockReturnValueOnce({ populate });

    const res2 = mockRes();
    await groups.updateScore({ params: { id: "g1" }, body: { robotId: "r1", result: "win" } }, res2);
    expect(g.save).toHaveBeenCalled();
    expect(res2.body.message).toBe("Zaktualizowano punktację");
  });
});


describe("resetGroups", () => {
  test("Should delete by filter", async () => {
    const res = mockRes();
    await groups.resetGroups(mockReq({ body: { categoryId: "c1" } }), res);
    expect(Group.deleteMany).toHaveBeenCalledWith({ category: "c1" });
    expect(res.body.message).toBe("Zresetowano grupy");
  });
});
