jest.mock("../models/Category", () => {
  const Ctor = jest.fn(function (init) {
    Object.assign(this, init);
    this.save = jest.fn().mockResolvedValue();
  });
  Ctor.findOne = jest.fn();
  Ctor.find = jest.fn();
  Ctor.findById = jest.fn();
  Ctor.findByIdAndUpdate = jest.fn();
  return Ctor;
});

jest.mock("../models/Robot", () => ({
  findById: jest.fn()
}));

const category = require("../controllers/categoryController");
const Category = require("../models/Category");
const Robot = require("../models/Robot");

function mockRes(){ return { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(p){ this.body=p; return this; } }; }

beforeEach(() => jest.clearAllMocks());


describe("createCategory", () => {
  test("Should reject duplicate and then create", async () => {
    const res1 = mockRes();
    Category.findOne.mockResolvedValueOnce({ _id: "1" });
    await category.createCategory({ body: { name: "A" } }, res1);
    expect(res1.statusCode).toBe(400);

    const res2 = mockRes();
    Category.findOne.mockResolvedValueOnce(null);
    await category.createCategory({ body: { name: "B" } }, res2);

    const instance = Category.mock.instances[0];
    expect(instance.save).toHaveBeenCalled();
    expect(res2.body.message).toBe("Kategoria utworzona");
  });
});


describe("getCategories", () => {
  test("Should return list", async () => {
    const categories = [{ _id: "c1" }];
    const populate = jest.fn().mockResolvedValueOnce(categories);
    Category.find.mockReturnValueOnce({ populate });
    const res = mockRes();
    await category.getCategories({}, res);
    expect(populate).toHaveBeenCalledWith("robots", "name");
    expect(res.body).toEqual(categories);
  });
});


describe("assignRobot", () => {
  test("Should validate and update relations", async () => {
    const res1 = mockRes();
    await category.assignRobot({ body: { robotId: "r1", categoryId: "c1" } }, res1);
    expect(res1.statusCode).toBe(404);

    const cat = { _id: "c1", name: "Cat", robots: [], save: jest.fn() };
    const rob = { _id: "r1", save: jest.fn() };
    Category.findById.mockResolvedValueOnce(cat);
    Robot.findById.mockResolvedValueOnce(rob);
    const res2 = mockRes();
    await category.assignRobot({ body: { robotId: "r1", categoryId: "c1" } }, res2);
    expect(rob.save).toHaveBeenCalled();
    expect(cat.save).toHaveBeenCalled();
    expect(res2.body.message).toMatch("Robot przypisany do kategorii Cat");
  });
});


describe("updateCategoryName", () => {
  test("Should validate empty and duplicate name and update", async () => {
    const res1 = mockRes();
    await category.updateCategoryName({ params: { id: "c1" }, body: { name: "" } }, res1);
    expect(res1.statusCode).toBe(400);

    Category.findOne.mockResolvedValueOnce({ _id: "c2" });
    const res2 = mockRes();
    await category.updateCategoryName({ params: { id: "c1" }, body: { name: "Taken" } }, res2);
    expect(res2.statusCode).toBe(400);

    Category.findByIdAndUpdate.mockResolvedValueOnce({ _id: "c1", name: "New" });
    const res3 = mockRes();
    await category.updateCategoryName({ params: { id: "c1" }, body: { name: "New" } }, res3);
    expect(res3.body.category).toEqual({ _id: "c1", name: "New" });
  });
});
