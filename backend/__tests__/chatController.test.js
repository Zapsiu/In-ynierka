jest.mock("../models/Conversation", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
}));

jest.mock("../models/Message", () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateMany: jest.fn()
}));

jest.mock("../models/User", () => ({
  find: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({ verify: jest.fn(() => ({ sub: "u1", role: "user" })) }));

const chat = require("../controllers/chatController");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

function mockRes(){ return { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(p){ this.body=p; return this; } }; }
function mockReq({ headers = {}, body = {}, params = {}, user = { id: "u1", role: "user" }, io = {} } = {}){ return { headers, body, params, user, app: { get: () => io } }; }

beforeEach(() => jest.clearAllMocks());


describe("authChat", () => {
  test("Should require bearer token and set req.user", () => {
    const res1 = mockRes();
    chat.authChat({ headers: {} }, res1, () => {});
    expect(res1.statusCode).toBe(401);

    const req = { headers: { authorization: "Bearer token" } };
    const res2 = mockRes();
    const next = jest.fn();
    chat.authChat(req, res2, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: "u1", role: "user" });
  });
});


describe("createConversation", () => {
  test("Should create or reuse conversation with staff", async () => {
    User.find.mockResolvedValueOnce([{ _id: "s1" }]);
    Conversation.findOne.mockResolvedValueOnce(null);
    Conversation.create.mockResolvedValueOnce({ _id: "c1" });

    const res = mockRes();
    await chat.createConversation(mockReq({ body: { staffUsernames: ["judge"] } }), res);
    expect(res.body._id).toBe("c1");
  });
});


describe("getConversations", () => {
  test("Should return conversations with unread counts", async () => {
    const list = [{ _id: "c1", toObject: () => ({ _id: "c1" }) }];
    const sort = jest.fn(() => Promise.resolve(list));
    Conversation.find.mockReturnValueOnce({ populate: () => ({ sort }) });

    Message.aggregate.mockResolvedValueOnce([{ _id: "c1", count: 2 }]);

    const res = mockRes();
    await chat.getConversations(mockReq(), res);
    expect(res.body[0].unreadCount).toBe(2);
  });
});


describe("getConversationMessages", () => {
  test("Should check access and return normalized messages", async () => {
    Conversation.findById.mockResolvedValueOnce({ _id: "c1", ownerUserId: "u1", staffIds: [] });
    Message.find.mockReturnValueOnce({ sort: () => ({ populate: () => ([{ _id: "m1", conversationId: "c1", body: "hi", createdAt: 1, senderId: { _id: "u1", username: "u", role: "user", firstName: "F", lastName: "L" } }]) }) });

    const res = mockRes();
    await chat.getConversationMessages(mockReq({ params: { id: "c1" } }), res);
    expect(res.body[0].sender.username).toBe("u");
  });
});


describe("postConversationMessage", () => {
  test("Should validate access and post message and emit", async () => {
    Conversation.findById.mockResolvedValueOnce({ _id: "c1", ownerUserId: "u1", staffIds: [], save: jest.fn() });
    Message.create.mockResolvedValueOnce({ _id: "m1" });
    Message.findById.mockReturnValueOnce({ populate: () => ({ _id: "m1", conversationId: "c1", body: "hi", createdAt: 1, senderId: { _id: "u1", username: "u", role: "user", firstName: "F", lastName: "L" } }) });

    const io = { to: () => ({ emit: jest.fn() }) };
    const res = mockRes();
    await chat.postConversationMessage(mockReq({ params: { id: "c1" }, body: { body: "hi" }, io }), res);
    expect(res.body.body).toBe("hi");
  });
});


describe("markConversationRead", () => {
  test("Should update many and emit", async () => {
    Conversation.findById.mockResolvedValueOnce({ _id: "c1", ownerUserId: "u1", staffIds: [] });
    const io = { to: () => ({ emit: jest.fn() }) };
    const res = mockRes();
    await chat.markConversationRead(mockReq({ params: { id: "c1" }, io }), res);
    expect(Message.updateMany).toHaveBeenCalled();
    expect(res.body).toEqual({ ok: true });
  });
});
