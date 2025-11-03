const Category = require("../models/Category");
const Robot = require("../models/Robot");

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Kategoria już istnieje" });

    const category = new Category({ name, description });
    await category.save();
    res.json({ message: "Kategoria utworzona", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("robots", "name");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Błąd pobierania kategorii" });
  }
};

exports.assignRobot = async (req, res) => {
  const { robotId, categoryId } = req.body;

  try {
    const category = await Category.findById(categoryId);
    const robot = await Robot.findById(robotId);
    if (!category || !robot) return res.status(404).json({ message: "Nie znaleziono danych" });

    robot.category = category._id;
    await robot.save();

    if (!category.robots.includes(robot._id)) {
      category.robots.push(robot._id);
      await category.save();
    }

    res.json({ message: `Robot przypisany do kategorii ${category.name}` });
  } catch (err) {
    res.status(500).json({ message: "Błąd przypisywania robota" });
  }
};
