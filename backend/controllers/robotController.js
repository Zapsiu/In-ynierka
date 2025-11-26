const Robot = require("../models/Robot");
const User = require("../models/User");
const Category = require("../models/Category");

exports.createRobot = async (req, res) => {
  const { username, robotName, categoryId } = req.body;

  try {
    const user = await User.findOne({ username }).populate("team");
    if (!user || !user.team) {
      return res.status(400).json({ message: "Użytkownik nie należy do drużyny" });
    }

    if (!robotName) {
      return res.status(400).json({ message: "Brak nazwy robota" });
    }

    const existing = await Robot.findOne({ name: robotName, team: user.team._id });
    if (existing) {
      return res.status(400).json({ message: "Robot o tej nazwie już istnieje w drużynie" });
    }

    let category = null;
    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: "Nie znaleziono kategorii" });
      }
    }

    const robot = new Robot({
      name: robotName,
      team: user.team._id,
      category: category ? category._id : null
    });

    await robot.save();

    if (category) {
      if (!Array.isArray(category.robots)) {
        category.robots = [];
      }
      if (!category.robots.find(id => String(id) === String(robot._id))) {
        category.robots.push(robot._id);
        await category.save();
      }
    }

    res.json({ message: "Robot utworzony", robot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera przy tworzeniu robota" });
  }
};

exports.getTeamRobots = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.team) {
      return res.status(400).json({ message: "Użytkownik nie należy do drużyny" });
    }

  const robots = await Robot.find({ team: user.team })
    .populate("category", "name");
    res.json(robots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd pobierania robotów" });
  }
};

exports.listRobots = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = {};
    if (categoryId) query.category = categoryId;
    const robots = await Robot.find(query).select("_id name category");
    res.json(robots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd pobierania robotów" });
  }
};
