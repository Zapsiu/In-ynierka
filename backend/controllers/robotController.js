const Robot = require("../models/Robot");
const User = require("../models/User");

exports.createRobot = async (req, res) => {
  const { username, robotName } = req.body;

  try {
    const user = await User.findOne({ username }).populate("team");
    if (!user || !user.team) {
      return res.status(400).json({ message: "Użytkownik nie należy do drużyny" });
    }

    const existing = await Robot.findOne({ name: robotName, team: user.team._id });
    if (existing) {
      return res.status(400).json({ message: "Robot o tej nazwie już istnieje w drużynie" });
    }

    const robot = new Robot({
      name: robotName,
      team: user.team._id
    });

    await robot.save();

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

    const robots = await Robot.find({ team: user.team });
    res.json(robots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd pobierania robotów" });
  }
};
