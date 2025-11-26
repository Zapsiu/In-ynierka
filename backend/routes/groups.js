const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  listGroups,
  generateGroups,
  updateScore,
  resetGroups
} = require("../controllers/GroupsController");

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

router.get("/", listGroups);
router.post("/generate", requireJudge, generateGroups);
router.post("/:id/score", requireJudge, updateScore);
router.post("/reset", requireJudge, resetGroups);

module.exports = router;
