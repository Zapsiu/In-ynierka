jest.mock("../models/Team", () => {
  const Ctor = jest.fn(function (init) {
    Object.assign(this, init);
    this.save = jest.fn().mockResolvedValue();
  });
  Ctor.findOne = jest.fn();
  Ctor.findById = jest.fn();
  Ctor.find = jest.fn();
  return Ctor;
});

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  updateOne: jest.fn()
}));

jest.mock("../models/Settings", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("../utils/notify", () => ({ createNotification: jest.fn() }));

const team = require("../controllers/teamController");
const Team = require("../models/Team");
const User = require("../models/User");
const Settings = require("../models/Settings");
const { createNotification } = require("../utils/notify");

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}
function mockReq({ body = {}, params = {}, io = {} } = {}) {
  return { body, params, app: { get: () => io } };
}

beforeEach(() => jest.clearAllMocks());


describe("createTeam", () => {
  test("Should create new team with default limit and attach user", async () => {
    const user = { _id: "u1" };
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(user) });
    Team.findOne.mockResolvedValueOnce(null);
    Settings.findOne.mockResolvedValueOnce({ defaultTeamLimit: 7 });

    const res = mockRes();
    await team.createTeam(mockReq({ body: { teamName: "A", username: "john" } }), res);

    expect(Team).toHaveBeenCalledWith(expect.objectContaining({ teamName: "A", limit: 7, members: [user._id], ownerId: user._id }));
    const instance = Team.mock.instances[0];
    expect(instance.save).toHaveBeenCalled();

    expect(User.updateOne).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Drużyna utworzona");
  });
});


describe("joinTeam (disabled)", () => {
  test("Should always return 403 according to controller", async () => {
    const res = mockRes();
    await team.joinTeam(mockReq({ body: { username: "u" }, params: { id: "t1" } }), res);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Dołączanie wyłącznie przez właściciela (dodanie po nicku)." });
  });
});


describe("getAllTeams", () => {
  test("Should return teams with populated members", async () => {
    const teams = [{ _id: "t1", members: [] }];
    const populate = jest.fn().mockResolvedValueOnce(teams);
    Team.find.mockReturnValueOnce({ populate });

    const res = mockRes();
    await team.getAllTeams({}, res);

    expect(Team.find).toHaveBeenCalled();
    expect(populate).toHaveBeenCalledWith("members", "username");
    expect(res.body).toEqual(teams);
  });
});


describe("leaveTeam", () => {
  test("Should reject when user has no team", async () => {
    const populate = jest.fn().mockResolvedValueOnce({ username: "u", team: null });
    User.findOne.mockReturnValueOnce({ populate });

    const res = mockRes();
    await team.leaveTeam(mockReq({ body: { username: "u" } }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Użytkownik nie należy do drużyny" });
  });
});


describe("addMemberByUsername", () => {
  test("Should validate permissions, add and notify", async () => {
    const req = mockReq({ body: { teamId: "t1", requesterUsername: "req", usernameToAdd: "add" }, io: {} });
    const res = mockRes();

    const teamDoc = {
      _id: "t1",
      teamName: "Team T",
      ownerId: { username: "req" },
      members: [{ username: "req", _id: "u1" }],
      limit: 10,
      save: jest.fn()
    };

    const populateMembers = jest.fn().mockResolvedValueOnce(teamDoc);
    const populateOwner = jest.fn(() => ({ populate: populateMembers }));
    Team.findById.mockReturnValueOnce({ populate: populateOwner });

    const userToAdd = { _id: "u2", username: "add", team: null, save: jest.fn() };
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(userToAdd) });

    await team.addMemberByUsername(req, res);

    expect(teamDoc.save).toHaveBeenCalled();
    expect(userToAdd.save).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: userToAdd._id,
      type: "team_member_added",
      meta: { teamId: teamDoc._id }
    }));
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch("Dodano");
  });
});


describe("getTeamByUsername", () => {
  test("Should return null when user has no team", async () => {
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce({ _id: "u1", team: null }) });

    const res = mockRes();
    await team.getTeamByUsername({ params: { username: "u" } }, res);

    expect(res.body).toBeNull();
  });
});
