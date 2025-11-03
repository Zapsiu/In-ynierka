const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const Playoff = require("../models/Playoff");
const User = require("../models/User");

async function requireJudge(req, res, next) {
  try {
    const username = req.headers["x-username"];
    if (!username) return res.status(401).json({ message: "Brak nagłówka x-username" });
    const u = await User.findOne({ username }).lean();
    if (!u) return res.status(401).json({ message: "Nie znaleziono użytkownika" });
    if (!["judge", "admin"].includes(u.role)) return res.status(403).json({ message: "Tylko sędzia lub admin" });
    next();
  } catch (e) { console.error(e); res.status(500).json({ message: "Błąd autoryzacji" }); }
}

router.post("/generate", requireJudge, async (req, res) => {
  const size = Math.max(2, Math.min(64, Number(req.body?.size) || 8));
  const groups = await Group.find().populate({ path: "scores.robot", select: "name team" }).lean();

  const map = new Map();
  for (const g of groups) {
    for (const s of (g.scores || [])) {
      const id = s.robot?._id?.toString();
      if (!id) continue;
      const prev = map.get(id) || { robot: s.robot, points: 0 };
      map.set(id, { robot: s.robot, points: prev.points + (s.points || 0) });
    }
  }
  const table = Array.from(map.values()).sort((a,b)=>b.points-a.points).slice(0, size);

  const seeds = table.map((e, i) => ({ seed: i+1, robot: e.robot._id, points: e.points }));
  const round1 = [];
  for (let i=0; i<Math.floor(table.length/2); i++) {
    round1.push({ a: table[i].robot._id, b: table[table.length-1-i].robot._id });
  }

  await Playoff.deleteMany({});
  const saved = await Playoff.create({ size: table.length, seeds, round1 });
  const populated = await Playoff.findById(saved._id)
    .populate({ path: "seeds.robot", select: "name team", populate: { path: "team", select: "teamName" } })
    .populate({ path: "round1.a", select: "name team", populate: { path: "team", select: "teamName" } })
    .populate({ path: "round1.b", select: "name team", populate: { path: "team", select: "teamName" } })
    .lean();

  res.status(201).json({ message: "Wygenerowano play-off", playoff: populated });
});

router.get("/", async (_req, res) => {
  const last = await Playoff.findOne().sort({ createdAt: -1 })
    .populate({ path: "seeds.robot", select: "name team", populate: { path: "team", select: "teamName" } })
    .populate({ path: "round1.a", select: "name team", populate: { path: "team", select: "teamName" } })
    .populate({ path: "round1.b", select: "name team", populate: { path: "team", select: "teamName" } })
    .lean();
  res.json({ playoff: last });
});

module.exports = router;
