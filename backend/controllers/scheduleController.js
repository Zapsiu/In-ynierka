const User = require("../models/User");
const ScheduleEntry = require("../models/ScheduleEntry");
const Robot = require("../models/Robot");
const { createNotification } = require("../utils/notify");


exports.requireJudgeOrAdmin = async (req, res, next) => {
  try {
    const username = req.headers["x-username"];
    if (!username) {
      return res.status(401).json({ message: "Brak nagłówka x-username" });
    }
    const u = await User.findOne({ username }).lean();
    if (!u) {
      return res.status(401).json({ message: "Nie znaleziono użytkownika" });
    }
    if (!["judge", "admin"].includes(u.role)) {
      return res.status(403).json({ message: "Tylko sędzia lub admin" });
    }
    req.user = u;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd autoryzacji" });
  }
};


async function getUsersForEntry(entry) {
  let usersToNotify = [];

  if (entry.category) {
    const robots = await Robot.find({ category: entry.category })
      .select("team")
      .lean();

    const teamIds = [
      ...new Set(robots.map((r) => String(r.team)).filter(Boolean))
    ];

    if (teamIds.length > 0) {
      usersToNotify = await User.find({ team: { $in: teamIds } })
        .select("_id")
        .lean();
    }
  }

  if (usersToNotify.length === 0) {
    usersToNotify = await User.find().select("_id").lean();
  }

  return usersToNotify;
}

async function scheduleNotify(type, entry, io) {
  const users = await getUsersForEntry(entry);

  const messages = {
    created: `Nowe wydarzenie w harmonogramie: ${entry.title}.`,
    updated: `Zaktualizowano wydarzenie: ${entry.title}.`,
    deleted: `Wydarzenie "${entry.title}" zostało odwołane.`
  };

  await Promise.all(
    users.map((u) =>
      createNotification({
        userId: u._id,
        type: `schedule_${type}`,
        message: messages[type],
        meta: {
          entryId: entry._id,
          categoryId: entry.category || null,
          startTime: entry.startTime,
          endTime: entry.endTime
        },
        io
      })
    )
  );
}


exports.getSchedule = async (req, res) => {
  try {
    const { categoryId, from, to } = req.query;
    const filter = {};

    if (categoryId) filter.category = categoryId;

    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }

    const list = await ScheduleEntry.find(filter)
      .populate("category", "name")
      .sort({ startTime: 1 })
      .lean();

    res.json({ schedule: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd pobierania harmonogramu" });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { title, categoryId, location, startTime, endTime } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Brak wymaganych pól" });
    }

    const doc = await ScheduleEntry.create({
      title,
      category: categoryId || null,
      location: location || "",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id
    });

    const io = req.app.get("io");
    await scheduleNotify("created", doc, io);

    res.status(201).json({ message: "Dodano wydarzenie", entry: doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd tworzenia wydarzenia" });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { title, categoryId, location, startTime, endTime } = req.body;
    const update = {};

    if (title !== undefined) update.title = title;
    if (categoryId !== undefined) update.category = categoryId || null;
    if (location !== undefined) update.location = location;
    if (startTime !== undefined) update.startTime = new Date(startTime);
    if (endTime !== undefined) update.endTime = new Date(endTime);

    const updated = await ScheduleEntry.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Nie znaleziono wydarzenia" });
    }

    const io = req.app.get("io");
    await scheduleNotify("updated", updated, io);

    res.json({ message: "Zaktualizowano wydarzenie", entry: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd edycji wydarzenia" });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const entry = await ScheduleEntry.findById(req.params.id).lean();
    await ScheduleEntry.findByIdAndDelete(req.params.id);

    if (entry) {
      const io = req.app.get("io");
      await scheduleNotify("deleted", entry, io);
    }

    res.json({ message: "Usunięto wydarzenie" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd usuwania wydarzenia" });
  }
};
