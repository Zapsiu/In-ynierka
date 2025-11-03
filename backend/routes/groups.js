const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");
const Robot = require("../models/Robot");

async function requireJudge(req, res, next) {
  try {
    const username = req.headers["x-username"];
    if (!username) return res.status(401).json({ message: "Brak nagłówka x-username" });
    const u = await User.findOne({ username }).lean();
    if (!u) return res.status(401).json({ message: "Nie znaleziono użytkownika" });
    if (!["judge", "admin"].includes(u.role)) {
      return res.status(403).json({ message: "Tylko sędzia lub admin" });
    }
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd autoryzacji" });
  }
}

router.get("/", async (_req, res) => {
  const groups = await Group.find()
    .populate({ path: "members", select: "name team", populate: { path: "team", select: "teamName" } })
    .populate({ path: "scores.robot", select: "name team", populate: { path: "team", select: "teamName" } })
    .populate({ path: "winner", select: "name team", populate: { path: "team", select: "teamName" } })
    .lean();
  res.json({ groups });
});

router.post("/generate", requireJudge, async (req, res) => {
  try {
    const { size = 4, robotIds } = req.body || {};
    let pool = [];

    if (Array.isArray(robotIds) && robotIds.length) {
      const robots = await Robot.find({ _id: { $in: robotIds } }).select("_id");
      pool = robots.map(r => r._id);
    } else {
      const robots = await Robot.find({}).select("_id");
      pool = robots.map(r => r._id);
    }
    if (pool.length < 2) return res.status(400).json({ message: "Za mało robotów do wygenerowania grup" });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    await Group.deleteMany({});

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const docs = [];
    for (let i = 0; i < pool.length; i += Number(size)) {
      const chunk = pool.slice(i, i + Number(size));
      if (!chunk.length) continue;
      docs.push({
        name: `Grupa ${letters[Math.floor(i / Number(size))] || (Math.floor(i / Number(size)) + 1)}`,
        members: chunk,
        scores: chunk.map(id => ({ robot: id, points: 0, played: 0, wins: 0, draws: 0, losses: 0 })),
        winner: null
      });
    }
    await Group.insertMany(docs);

    const groups = await Group.find()
      .populate({ path: "members", select: "name team", populate: { path: "team", select: "teamName" } })
      .populate({ path: "scores.robot", select: "name team", populate: { path: "team", select: "teamName" } })
      .lean();

    res.status(201).json({ message: "Wygenerowano grupy z robotów", groups });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd generowania grup" });
  }
});

router.post("/:id/score", requireJudge, async (req, res) => {
  try {
    const { id } = req.params;
    const { robotId, result } = req.body || {};
    if (!robotId || !['win','draw','loss'].includes(result)) {
      return res.status(400).json({ message: "Wymagane: robotId oraz result ∈ {win, draw, loss}" });
    }

    const g = await Group.findById(id);
    if (!g) return res.status(404).json({ message: "Nie znaleziono grupy" });
    if (!g.members.find(m => m.toString() === robotId)) {
      return res.status(400).json({ message: "Robot nie należy do tej grupy" });
    }

    const row = g.scores.find(s => s.robot.toString() === robotId);
    if (!row) return res.status(404).json({ message: "Brak wpisu punktowego dla robota" });

    if (result === 'win') { row.points += 3; row.wins += 1; }
    else if (result === 'draw') { row.points += 1; row.draws += 1; }
    else { row.losses += 1; }
    row.played += 1;

    await g.save();

    const populated = await Group.findById(id)
      .populate({ path: "members", select: "name team", populate: { path: "team", select: "teamName" } })
      .populate({ path: "scores.robot", select: "name team", populate: { path: "team", select: "teamName" } })
      .lean();

    res.json({ message: "Zaktualizowano punktację", group: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd zapisu punktów" });
  }
});

router.post("/reset", requireJudge, async (_req, res) => {
  try {
    await Group.deleteMany({});
    res.json({ message: "Zresetowano grupy" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd resetu grup" });
  }
});

module.exports = router;
