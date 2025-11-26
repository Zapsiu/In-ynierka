const User = require("../models/User");
const Team = require("../models/Team");
const Settings = require("../models/Settings");
const Robot = require("../models/Robot");
const Category = require("../models/Category");
const { createNotification } = require("../utils/notify");

exports.updateUserRole = async (req, res) => {
  const { username, newRole } = req.body;

  if (!["user", "admin", "judge"].includes(newRole)) {
    return res.status(400).json({ message: "Nieprawidłowa rola." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Użytkownik nie znaleziony." });

    user.role = newRole;
    await user.save();

    res.json({ message: `Rola użytkownika ${username} zmieniona na ${newRole}` });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.updateTeamLimit = async (req, res) => {
  try {
    const { teamId, newLimit } = req.body;

    if (!teamId || isNaN(newLimit) || newLimit < 1) {
      return res.status(400).json({ message: "Nieprawidłowe dane." });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Drużyna nie znaleziona" });

    team.limit = parseInt(newLimit);
    await team.save();

    res.json({ message: `Limit drużyny "${team.teamName}" ustawiony na ${newLimit}` });
  } catch (err) {
    console.error("Błąd backendu przy updateTeamLimit:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.getDefaultTeamLimit = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ defaultTeamLimit: 5 });
    res.json({ limit: settings.defaultTeamLimit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera przy pobieraniu limitu" });
  }
};

exports.setDefaultTeamLimit = async (req, res) => {
  const { limit } = req.body;
  if (!limit || isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Nieprawidłowy limit" });
  }

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ defaultTeamLimit: limit });
    } else {
      settings.defaultTeamLimit = limit;
    }
    await settings.save();
    res.json({ message: "Zapisano nowy domyślny limit" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera przy zapisie limitu" });
  }
};

exports.removeMemberFromTeam = async (req, res) => {
  const { teamId, username } = req.body;

  try {
    const user = await User.findOne({ username });
    const team = await Team.findById(teamId);

    if (!user || !team) return res.status(404).json({ message: "Nie znaleziono danych" });

    team.members = team.members.filter(id => id.toString() !== user._id.toString());
    await team.save();

    await User.updateOne({ _id: user._id }, { $set: { team: null } });
        const io = req.app.get("io");
    await createNotification({
      userId: user._id,
      type: "team_member_removed",
      message: `Zostałeś usunięty z drużyny ${team.teamName}.`,
      meta: { teamId: team._id },
      io
    });

    res.json({ message: `Usunięto ${username} z drużyny` });
  } catch (err) {
    console.error("Błąd usuwania członka:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};
exports.deleteRobot = async (req, res) => {
  const { robotId } = req.params;
  try {
    await Robot.findByIdAndDelete(robotId);
    res.json({ message: "Robot usunięty" });
  } catch (err) {
    console.error("Błąd usuwania robota:", err);
    res.status(500).json({ message: "Błąd usuwania robota" });
  }
};
exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    await Robot.updateMany({ category: categoryId }, { $set: { category: null } });
    await Category.findByIdAndDelete(categoryId);
    res.json({ message: "Kategoria usunięta" });
  } catch (err) {
    console.error("Błąd usuwania kategorii:", err);
    res.status(500).json({ message: "Błąd usuwania kategorii" });
  }
};
exports.deleteTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    await Robot.deleteMany({ team: teamId });
    await User.updateMany({ team: teamId }, { $set: { team: null } });
    await Team.findByIdAndDelete(teamId);
    res.json({ message: "Drużyna usunięta wraz z robotami" });
  } catch (err) {
    console.error("Błąd usuwania drużyny:", err);
    res.status(500).json({ message: "Błąd usuwania drużyny" });
  }
};
exports.deleteUser = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    if (user.team) {
      await Team.updateOne(
        { _id: user.team },
        { $pull: { members: user._id } }
      );
    }

    await User.deleteOne({ _id: user._id });

    res.json({ message: `Użytkownik ${username} został usunięty` });
  } catch (err) {
    console.error("Błąd usuwania użytkownika:", err);
    res.status(500).json({ message: "Błąd serwera przy usuwaniu użytkownika" });
  }
};