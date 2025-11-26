const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const username = req.headers["x-username"];
    if (!username) {
      return res.status(401).json({ message: "Brak nagłówka x-username" });
    }
    const u = await User.findOne({ username }).lean();
    if (!u) {
      return res.status(401).json({ message: "Nie znaleziono użytkownika" });
    }
    req.user = u;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Błąd autoryzacji" });
  }
}

router.get("/", requireAuth, async (req, res) => {
  const list = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ notifications: list });
});

router.post("/:id/read", requireAuth, async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } }
  );
  res.json({ message: "OK" });
});

router.post("/read-all", requireAuth, async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );
  res.json({ message: "OK" });
});
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  await Notification.deleteOne({
    _id: id,
    user: req.user._id
  });

  res.json({ message: "Powiadomienie usunięte" });
});

router.delete("/", requireAuth, async (req, res) => {
  await Notification.deleteMany({
    user: req.user._id
  });

  res.json({ message: "Wyczyszczono wszystkie powiadomienia" });
});
module.exports = router;
