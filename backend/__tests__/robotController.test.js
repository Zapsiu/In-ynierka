jest.mock("../models/Robot", () => ({
  findOne: jest.fn(),
  find: jest.fn()
}));

jest.mock("../models/User", () => ({
  findOne: jest.fn()
}));

jest.mock("../models/Category", () => ({
  findById: jest.fn()
}));

const robot = require("../controllers/robotController");
const Robot = require("../models/Robot");
const User = require("../models/User");
const Category = require("../models/Category");

function mockRes(){ return { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(p){ this.body=p; return this; } }; }

beforeEach(() => jest.clearAllMocks());


describe("createRobot", () => {
  test("Should validate team and robot existence and category", async () => {
    User.findOne.mockReturnValueOnce({ populate: jest.fn().mockResolvedValueOnce({ team: null }) });
    const res1 = mockRes();
    await robot.createRobot({ body: { username: "u" } }, res1);
    expect(res1.statusCode).toBe(400);

    User.findOne.mockReturnValueOnce({ populate: jest.fn().mockResolvedValueOnce({ team: { _id: "t1" } }) });
    const res2 = mockRes();
    await robot.createRobot({ body: { username: "u" } }, res2);
    expect(res2.statusCode).toBe(400);

    User.findOne.mockReturnValueOnce({ populate: jest.fn().mockResolvedValueOnce({ team: { _id: "t1" } }) });
    Robot.findOne.mockResolvedValueOnce({ _id: "r" });
    const res3 = mockRes();
    await robot.createRobot({ body: { username: "u", robotName: "R1" } }, res3);
    expect(res3.statusCode).toBe(400);

    User.findOne.mockReturnValueOnce({ populate: jest.fn().mockResolvedValueOnce({ team: { _id: "t1" } }) });
    Robot.findOne.mockResolvedValueOnce(null);
    Category.findById.mockResolvedValueOnce(null);
    const res4 = mockRes();
    await robot.createRobot({ body: { username: "u", robotName: "R1", categoryId: "c" } }, res4);
    expect(res4.statusCode).toBe(400);
  });
});


describe("getTeamRobots", () => {
  test("Should validate user team", async () => {
    User.findOne.mockResolvedValueOnce({ team: null });
    const res = mockRes();
    await robot.getTeamRobots({ params: { username: "u" } }, res);
    expect(res.statusCode).toBe(400);
  });

  test("Should return populated robots for team", async () => {
    User.findOne.mockResolvedValueOnce({ team: "t1" });
    const robots = [{ _id: "r1", name: "R1" }];
    const populate = jest.fn().mockResolvedValueOnce(robots);
    Robot.find.mockReturnValueOnce({ populate });
    const res = mockRes();
    await robot.getTeamRobots({ params: { username: "u" } }, res);
    expect(populate).toHaveBeenCalledWith("category", "name");
    expect(res.body).toEqual(robots);
  });
});


describe("listRobots", () => {
  test("Should call find with category filter", async () => {
    const data = [{ _id: "r1" }];
    const select = jest.fn().mockResolvedValueOnce(data);
    Robot.find.mockReturnValueOnce({ select });
    const res = mockRes();
    await robot.listRobots({ query: { categoryId: "c1" } }, res);
    expect(res.body).toEqual(data);
  });
});
