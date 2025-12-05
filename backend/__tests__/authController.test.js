jest.mock("../models/User", () => {
  const Ctor = jest.fn(function (init) {
    Object.assign(this, init);
    this.save = jest.fn().mockResolvedValue();
  });
  Ctor.findOne = jest.fn();
  Ctor.findByIdAndUpdate = jest.fn();
  return Ctor;
});

jest.mock("bcrypt", () => ({
  hash: jest.fn(async (pw) => `hashed:${pw}`),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token123")
}));

const auth = require("../controllers/authController");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function mockReq({ headers = {}, body = {}, params = {} } = {}) {
  return { headers, body, params };
}

beforeEach(() => {
  jest.clearAllMocks();
});


describe("register", () => {
  test("Should reject duplicate username", async () => {
    const req = mockReq({
      body: {
        username: "u",
        password: "p",
        email: "e@mail",
        firstName: "F",
        lastName: "L",
        age: 10
      }
    });

    User.findOne.mockResolvedValueOnce({ _id: "1" });

    const res = mockRes();
    await auth.register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Użytkownik już istnieje" });
  });

  test("Should reject duplicate email", async () => {
    const req = mockReq({
      body: {
        username: "u",
        password: "p",
        email: "e@mail",
        firstName: "F",
        lastName: "L",
        age: 10
      }
    });

    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: "2" }); 

    const res = mockRes();
    await auth.register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Email jest już zajęty" });
  });

  test("Should create user and return 201", async () => {
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null); 

    const req = mockReq({
      body: {
        username: "john",
        password: "secret",
        firstName: "J",
        lastName: "D",
        age: 20,
        email: "j@d"
      }
    });
    const res = mockRes();

    await auth.register(req, res);

    expect(User).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
    const instance = User.mock.instances[0];
    expect(instance.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "Użytkownik zarejestrowany" });
  });
});


describe("login", () => {
  test("Should validate inputs and reject", async () => {
    const res = mockRes();
    await auth.login(mockReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Brak loginu/e-maila lub hasła" });
  });

  test("Should reject when user not found or bad password", async () => {
    const req = mockReq({ body: { identifier: "x", password: "p" } });

    const res1 = mockRes();
    User.findOne.mockResolvedValueOnce(null);
    await auth.login(req, res1);
    expect(res1.statusCode).toBe(401);

    const user = { password: "hashed:pw" };
    const res2 = mockRes();
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false);
    await auth.login(req, res2);
    expect(res2.statusCode).toBe(401);
  });

  test("Should sign and return token and user", async () => {
    const user = {
      _id: "u1",
      username: "john",
      role: "user",
      team: null,
      password: "hpw"
    };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = mockRes();
    await auth.login(
      mockReq({ body: { identifier: "john", password: "secret" } }),
      res
    );
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.body.user).toEqual({
      id: user._id,
      username: user.username,
      role: user.role,
      team: user.team
    });
  });
});


describe("getProfile", () => {
  test("Should require header and 404 when user missing", async () => {
    const res1 = mockRes();
    await auth.getProfile(mockReq(), res1);
    expect(res1.statusCode).toBe(400);

    const populate = jest.fn().mockResolvedValueOnce(null);
    User.findOne.mockReturnValueOnce({ populate });
    const res2 = mockRes();
    await auth.getProfile(
      mockReq({ headers: { "x-username": "john" } }),
      res2
    );
    expect(res2.statusCode).toBe(404);
  });
});


describe("updateProfile", () => {
  test("Should require header and validate unique email/username", async () => {
    const res1 = mockRes();
    await auth.updateProfile(mockReq(), res1);
    expect(res1.statusCode).toBe(400);

    const user = { _id: "u1", username: "john" };

    User.findOne
      .mockResolvedValueOnce(user) 
      .mockResolvedValueOnce({ _id: "u2" }); 

    const res2 = mockRes();
    await auth.updateProfile(
      mockReq({ headers: { "x-username": "john" }, body: { email: "a@b" } }),
      res2
    );
    expect(res2.statusCode).toBe(409);

    User.findOne
      .mockResolvedValueOnce(user) 
      .mockResolvedValueOnce({ _id: "u3" }); 

    const res3 = mockRes();
    await auth.updateProfile(
      mockReq({ headers: { "x-username": "john" }, body: { newUsername: "jane" } }),
      res3
    );
    expect(res3.statusCode).toBe(409);
  });
});


describe("changePasswordProfile", () => {
  test("Should validate headers and body and compare current password", async () => {
    const res1 = mockRes();
    await auth.changePasswordProfile(mockReq(), res1);
    expect(res1.statusCode).toBe(400);

    const res2 = mockRes();
    await auth.changePasswordProfile(
      mockReq({ headers: { "x-username": "john" }, body: {} }),
      res2
    );
    expect(res2.statusCode).toBe(400);

    const user = { _id: "u1", password: "hpw", save: jest.fn() };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false);
    const res3 = mockRes();
    await auth.changePasswordProfile(
      mockReq({
        headers: { "x-username": "john" },
        body: { currentPassword: "a", newPassword: "password123" }
      }),
      res3
    );
    expect(res3.statusCode).toBe(400);
  });

  test("Should change password and save", async () => {
    const user = { _id: "u1", password: "hpw", save: jest.fn() };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = mockRes();
    await auth.changePasswordProfile(
      mockReq({
        headers: { "x-username": "john" },
        body: { currentPassword: "a", newPassword: "password123" }
      }),
      res
    );
    expect(user.save).toHaveBeenCalled();
    expect(res.body).toEqual({ message: "Hasło zmienione" });
  });
});
