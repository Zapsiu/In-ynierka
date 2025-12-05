const Group = require("../models/Group");
const Robot = require("../models/Robot");
const User = require("../models/User");
const { createNotification } = require("../utils/notify");

exports.listGroups = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { category: categoryId } : {};

    const groups = await Group.find(filter)
      .populate({
        path: "members",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "scores.robot",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "winner",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .lean();

    res.json({ groups });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd pobierania grup" });
  }
};

exports.generateGroups = async (req, res) => {
  try {
    const { categoryId, groupsCount, size, robotIds } = req.body || {};
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let pool = [];

    if (categoryId) {
      const robots = await Robot.find({ category: categoryId }).select("_id");
      pool = robots.map((r) => r._id);
    } else if (Array.isArray(robotIds) && robotIds.length) {
      const robots = await Robot.find({ _id: { $in: robotIds } }).select("_id");
      pool = robots.map((r) => r._id);
    } else {
      const robots = await Robot.find({}).select("_id");
      pool = robots.map((r) => r._id);
    }

    if (!pool.length) {
      return res
        .status(400)
        .json({ message: "Brak robotów do podziału na grupy" });
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const deleteFilter = categoryId ? { category: categoryId } : {};
    await Group.deleteMany(deleteFilter);

    const docs = [];

    if (groupsCount) {
      let groupCount = Number(groupsCount) || 1;
      groupCount = Math.max(1, Math.min(letters.length, groupCount));
      groupCount = Math.min(groupCount, pool.length);

      const base = Math.floor(pool.length / groupCount);
      const extra = pool.length % groupCount;
      let cursor = 0;

      for (let gIndex = 0; gIndex < groupCount; gIndex++) {
        const currentSize = base + (gIndex < extra ? 1 : 0);
        const chunk = pool.slice(cursor, cursor + currentSize);
        cursor += currentSize;
        if (!chunk.length) continue;

        docs.push({
          name: `Grupa ${letters[gIndex] || gIndex + 1}`,
          category: categoryId || null,
          members: chunk,
          scores: chunk.map((id) => ({
            robot: id,
            points: 0,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0
          })),
          winner: null
        });
      }
    } else {
      const groupSize = Number(size) || 4;
      for (let i = 0; i < pool.length; i += groupSize) {
        const chunk = pool.slice(i, i + groupSize);
        if (!chunk.length) continue;
        const index = Math.floor(i / groupSize);
        docs.push({
          name: `Grupa ${letters[index] || index + 1}`,
          category: categoryId || null,
          members: chunk,
          scores: chunk.map((id) => ({
            robot: id,
            points: 0,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0
          })),
          winner: null
        });
      }
    }

    await Group.insertMany(docs);
    const robotsInGroups = await Robot.find({ _id: { $in: pool } })
      .select("team")
      .lean();
    const teamIds = [
      ...new Set(robotsInGroups.map((r) => String(r.team)).filter(Boolean))
    ];

    const usersToNotify = await User.find({ team: { $in: teamIds } })
      .select("_id")
      .lean();

    const io = req.app.get("io");
    await Promise.all(
      usersToNotify.map((u) =>
        createNotification({
          userId: u._id,
          type: "groups_generated",
          message: "Zostały wygenerowane grupy dla Twojej kategorii.",
          meta: { categoryId: categoryId || null },
          io
        })
      )
    );

    const resultFilter = categoryId ? { category: categoryId } : {};
    const groups = await Group.find(resultFilter)
      .populate({
        path: "members",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "scores.robot",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .lean();

    res.status(201).json({ message: "Wygenerowano grupy z robotów", groups });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd generowania grup" });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { robotId, result, delta } = req.body || {}; // delta: "inc" (domyślnie) lub "dec"

    if (!robotId || !["win", "draw", "loss"].includes(result)) {
      return res.status(400).json({
        message: "Wymagane: robotId oraz result ∈ {win, draw, loss}"
      });
    }

    const g = await Group.findById(id);
    if (!g) return res.status(404).json({ message: "Nie znaleziono grupy" });

    if (!g.members.find((m) => m.toString() === robotId)) {
      return res.status(400).json({ message: "Robot nie należy do tej grupy" });
    }

    const row = g.scores.find((s) => s.robot.toString() === robotId);
    if (!row) {
      return res
        .status(404)
        .json({ message: "Brak wpisu punktowego dla robota" });
    }

    const mode = delta === "dec" ? "dec" : "inc";

    if (mode === "inc") {
      if (result === "win") {
        row.points += 3;
        row.wins += 1;
      } else if (result === "draw") {
        row.points += 1;
        row.draws += 1;
      } else {
        row.losses += 1;
      }
      row.played += 1;
    } else {
      if (result === "win" && row.wins > 0) {
        row.wins -= 1;
        row.points = Math.max(0, row.points - 3);
        if (row.played > 0) row.played -= 1;
      } else if (result === "draw" && row.draws > 0) {
        row.draws -= 1;
        row.points = Math.max(0, row.points - 1);
        if (row.played > 0) row.played -= 1;
      } else if (result === "loss" && row.losses > 0) {
        row.losses -= 1;
        if (row.played > 0) row.played -= 1;
      }
    }

    await g.save();

    const populated = await Group.findById(id)
      .populate({
        path: "members",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "scores.robot",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .lean();

    res.json({ message: "Zaktualizowano punktację", group: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd zapisu punktów" });
  }
};


exports.resetGroups = async (req, res) => {
  try {
    const { categoryId } = req.body || {};
    const filter = categoryId ? { category: categoryId } : {};
    await Group.deleteMany(filter);
    res.json({ message: "Zresetowano grupy" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd resetu grup" });
  }
};
