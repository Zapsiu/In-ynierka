const Group = require("../models/Group");
const Playoff = require("../models/Playoff");
const Robot = require("../models/Robot");
const User = require("../models/User");
const { createNotification } = require("../utils/notify");

function largestPowerOfTwo(n, maxCap = 128) {
  let p = 1;
  while (p * 2 <= n && p * 2 <= maxCap) {
    p *= 2;
  }
  return p;
}

function seedPairing(seeds) {
  const pairs = [];
  let i = 0;
  let j = seeds.length - 1;
  while (i < j) {
    pairs.push([seeds[i], seeds[j]]);
    i += 1;
    j -= 1;
  }
  return pairs;
}

function computeBracket(playoffDoc) {
  const p = playoffDoc;

  const winners1 = (p.round1 || [])
    .map((m) => {
      if (m.winner === "a") return m.a;
      if (m.winner === "b") return m.b;
      return null;
    })
    .filter(Boolean);

  const oldR2 = Array.isArray(p.round2) ? p.round2 : [];
  const newRound2 = [];

  for (let i = 0; i < winners1.length; i += 2) {
    const a = winners1[i];
    const b = winners1[i + 1];
    if (!a || !b) continue;

    const prev = oldR2.find(
      (m) => String(m.a) === String(a) && String(m.b) === String(b)
    );

    newRound2.push({
      a,
      b,
      winner: prev ? prev.winner || null : null
    });
  }

  p.round2 = newRound2;

  const winners2 = (p.round2 || [])
    .map((m) => {
      if (m.winner === "a") return m.a;
      if (m.winner === "b") return m.b;
      return null;
    })
    .filter(Boolean);

  let final = p.final || null;
  if (winners2.length >= 2) {
    const a = winners2[0];
    const b = winners2[1];

    let winner = null;
    if (
      final &&
      String(final.a) === String(a) &&
      String(final.b) === String(b)
    ) {
      winner = final.winner || null;
    }
    final = { a, b, winner };
  } else {
    final = null;
  }
  p.final = final;
}

exports.generatePlayoff = async (req, res) => {
  try {
    const { size: requestedSizeRaw, categoryId } = req.body || {};

    const groupFilter = categoryId ? { category: categoryId } : {};
    const groups = await Group.find(groupFilter)
      .populate({
        path: "scores.robot",
        select: "name team category",
        populate: { path: "team", select: "teamName" }
      })
      .lean();

    const map = new Map();
    for (const g of groups) {
      for (const s of g.scores || []) {
        const r = s.robot;
        if (!r) continue;
        const id = r._id ? String(r._id) : String(r);
        if (!id) continue;

        const prev = map.get(id) || {
          robotId: r._id || r,
          points: 0
        };
        map.set(id, {
          robotId: prev.robotId,
          points: prev.points + (s.points || 0)
        });
      }
    }

    const table = Array.from(map.values()).sort(
      (a, b) => b.points - a.points
    );

    const available = table.length;
    if (available < 2) {
      return res
        .status(400)
        .json({ message: "Za mało robotów z wynikami w tej kategorii, aby wygenerować play-off" });
    }

    let maxPow = largestPowerOfTwo(available, 128);
    if (maxPow < 2) {
      return res
        .status(400)
        .json({ message: "Za mało robotów do utworzenia drabinki" });
    }

    let requested = Number(requestedSizeRaw) || maxPow;
    if (requested < 2) requested = 2;
    if (requested > maxPow) requested = maxPow;

    let size = 1;
    while (size * 2 <= requested) size *= 2;

    const selection = table.slice(0, size);
    if (selection.length < 2) {
      return res
        .status(400)
        .json({ message: "Nie udało się dobrać wystarczającej liczby robotów" });
    }

    const seeds = selection.map((e, idx) => ({
      seed: idx + 1,
      robot: e.robotId,
      points: e.points
    }));

    const pairs = seedPairing(seeds);
    const round1 = pairs.map(([sa, sb]) => ({
      a: sa.robot,
      b: sb.robot,
      winner: null
    }));

    await Playoff.deleteMany(categoryId ? { category: categoryId } : {});

    const saved = await Playoff.create({
      size: seeds.length,
      category: categoryId || null,
      seeds,
      round1,
      round2: [],
      final: null
    });

    const populated = await Playoff.findById(saved._id)
      .populate({
        path: "seeds.robot",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round1.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round1.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round2.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round2.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "final.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "final.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .lean();
        const robotIds = (seeds || []).map((s) => s.robot);
    const robots = await Robot.find({ _id: { $in: robotIds } })
      .select("team")
      .lean();
    const teamIds = [
      ...new Set(robots.map((r) => String(r.team)).filter(Boolean))
    ];

    const users = await User.find({ team: { $in: teamIds } })
      .select("_id")
      .lean();

    const io = req.app.get("io");
    await Promise.all(
      users.map((u) =>
        createNotification({
          userId: u._id,
          type: "playoff_generated",
          message:
            "Została wygenerowana drabinka play-off w Twojej kategorii.",
          meta: { playoffId: saved._id, categoryId },
          io
        })
      )
    );


    res.status(201).json({
      message: "Wygenerowano play-off",
      playoff: populated
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd generowania play-off" });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { round, index, winner } = req.body || {};

    if (!["round1", "round2", "final"].includes(round)) {
      return res.status(400).json({ message: "Nieprawidłowa runda" });
    }
    if (!["a", "b"].includes(winner)) {
      return res.status(400).json({ message: "Nieprawidłowy zwycięzca" });
    }

    const p = await Playoff.findById(id);
    if (!p) return res.status(404).json({ message: "Brak play-off" });

    if (round === "round1") {
      if (!p.round1[index]) {
        return res.status(400).json({ message: "Brak meczu w rundzie 1" });
      }
      p.round1[index].winner = winner;
    } else if (round === "round2") {
      if (!p.round2[index]) {
        return res.status(400).json({ message: "Brak meczu w rundzie 2" });
      }
      p.round2[index].winner = winner;
    } else if (round === "final") {
      if (!p.final) {
        return res.status(400).json({ message: "Finał jeszcze nie gotowy" });
      }
      p.final.winner = winner;
    }

    computeBracket(p);
    await p.save();

    const populated = await Playoff.findById(id)
      .populate({
        path: "seeds.robot",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round1.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round1.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round2.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round2.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "final.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "final.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .lean();

    res.json({ playoff: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd zapisu wyniku meczu" });
  }
};

exports.getCurrentPlayoff = async (req, res) => {
  try {
    const { categoryId } = req.query || {};
    const filter = categoryId ? { category: categoryId } : {};
    const last = await Playoff.findOne(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "seeds.robot",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round1.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round1.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round2.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "round2.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "final.a",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .populate({
        path: "final.b",
        select: "name team",
        populate: { path: "team", select: "teamName" }
      })
      .lean();

    res.json({ playoff: last });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd pobierania play-off" });
  }
};
