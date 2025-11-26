const Team = require("../models/Team");
const User = require("../models/User");
const Settings = require("../models/Settings");

// Tworzenie drużyny
exports.createTeam = async (req, res) => {
  const { teamName, username } = req.body;

  try {
    const user = await User.findOne({ username }).select("+email +firstName +lastName +age");
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    const existing = await Team.findOne({ teamName });
    if (existing) return res.status(400).json({ message: "Drużyna już istnieje" });

    const settings = await Settings.findOne(); 
    const limit = settings?.defaultTeamLimit || 5;

    const team = new Team({
      teamName,
      limit,
      members: [user._id],
      ownerId: user._id
    });

    await team.save();

    await User.updateOne({ _id: user._id }, { $set: { team: team._id } });
    res.status(201).json({ message: "Drużyna utworzona", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// Dołączanie do drużyny
exports.joinTeam = async (req, res) => {
  const { username } = req.body;
  const teamId = req.params.id;

  try {
    const user = await User.findOne({ username });
    const team = await Team.findById(teamId).populate("members");

    if (!user || !team) return res.status(404).json({ message: "Nie znaleziono" });
    if (user.team) return res.status(400).json({ message: "Użytkownik już w drużynie" });
    if (team.members.length >= team.limit) return res.status(400).json({ message: "Limit osiągnięty" });
    if (team.members.some(m => m._id.toString() === user._id.toString())) return res.status(400).json({ message: "Użytkownik już w tej drużynie" });

    team.members.push(user._id);
    await team.save();
    await User.updateOne({ _id: user._id }, { $set: { team: team._id } });


    res.json({ message: "Dołączono do drużyny", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// Pobieranie wszystkich drużyn
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("members", "username");
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd pobierania drużyn" });
  }
};

// Opuszczanie drużyny
exports.leaveTeam = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username }).populate("team");
    if (!user || !user.team) {
      return res.status(400).json({ message: "Użytkownik nie należy do drużyny" });
    }

    const team = await Team.findById(user.team._id);
    team.members = team.members.filter(m => m.toString() !== user._id.toString());
    await team.save();

    await User.updateOne({ _id: user._id }, { $set: { team: null } });


    res.json({ message: "Użytkownik opuścił drużynę" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.addMemberByUsername = async (req, res) => {
  try {
    const { teamId, requesterUsername, usernameToAdd } = req.body;
    if (!teamId || !requesterUsername || !usernameToAdd) {
      return res
        .status(400)
        .json({ message: "Brak danych: teamId / requesterUsername / usernameToAdd" });
    }
    if (requesterUsername === usernameToAdd) {
      return res.status(400).json({ message: "Nie możesz dodać samego siebie" });
    }

    const team = await Team.findById(teamId)
      .populate("ownerId", "username")
      .populate("members", "username");
    if (!team) return res.status(404).json({ message: "Nie znaleziono drużyny" });

    const isRequesterMember =
      team.members.some((m) => m.username === requesterUsername) ||
      team.ownerId?.username === requesterUsername;

    if (!isRequesterMember) {
      return res
        .status(403)
        .json({ message: "Tylko członkowie tej drużyny mogą dodawać osoby" });
    }

    const userToAdd = await User.findOne({ username: usernameToAdd }).select(
      "_id username team"
    );
    if (!userToAdd)
      return res.status(404).json({ message: "Nie znaleziono użytkownika do dodania" });

    if (team.limit && team.members.length >= team.limit) {
      return res
        .status(400)
        .json({ message: "Przekroczono limit członków drużyny" });
    }

    if (team.members.some((m) => String(m._id) === String(userToAdd._id))) {
      return res.status(400).json({ message: "Użytkownik już jest w tej drużynie" });
    }

    if (userToAdd.team && String(userToAdd.team) !== String(team._id)) {
      return res
        .status(400)
        .json({ message: "Użytkownik należy do innej drużyny" });
    }

    // faktyczne dodanie
    team.members.push(userToAdd._id);
    await team.save();

    userToAdd.team = team._id;
    await userToAdd.save();

    // powiadomienie (tu był błąd: user zamiast userToAdd)
    try {
      const { createNotification } = require("../utils/notify");
      const io = req.app.get("io");

      await createNotification({
        userId: userToAdd._id,
        type: "team_member_added",
        message: `Zostałeś dodany do drużyny ${team.teamName}.`,
        meta: { teamId: team._id },
        io,
      });
    } catch (notifyErr) {
      console.error("Błąd wysyłania powiadomienia:", notifyErr);
      // nie przerywamy dodawania, tylko logujemy
    }

    return res.json({
      message: `Dodano ${userToAdd.username} do drużyny ${team.teamName}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd dodawania członka" });
  }
};


exports.getTeamByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("_id username team");
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    if (!user.team) return res.json(null);

    const team = await Team.findById(user.team)
      .populate("ownerId", "username")
      .populate("members", "username");

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd pobierania drużyny" });
  }
};

exports.joinTeam = async (req, res) => {
  return res.status(403).json({ message: "Dołączanie wyłącznie przez właściciela (dodanie po nicku)." });
};