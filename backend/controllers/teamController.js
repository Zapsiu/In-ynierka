const Team = require("../models/Team");
const User = require("../models/User");

exports.createTeam = async (req, res) => {
  const { name, limit, username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    const existing = await Team.findOne({ name });
    if (existing) return res.status(400).json({ message: "Taka drużyna już istnieje" });

    const team = new Team({ name, limit, members: [user._id] });
    await team.save();

    user.team = team._id;
    await user.save();

    res.status(201).json({ message: "Drużyna utworzona", team });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.joinTeam = async (req, res) => {
  const { username } = req.body;
  const teamId = req.params.id;

  try {
    const user = await User.findOne({ username });
    const team = await Team.findById(teamId).populate("members");

    if (!user || !team) return res.status(404).json({ message: "Nie znaleziono" });

    if (user.team) return res.status(400).json({ message: "Użytkownik już w drużynie" });
    if (team.members.length >= team.limit) return res.status(400).json({ message: "Limit osiągnięty" });

    team.members.push(user._id);
    await team.save();

    user.team = team._id;
    await user.save();

    res.json({ message: "Dołączono do drużyny", team });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("members", "username");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Błąd pobierania drużyn" });
  }
};
