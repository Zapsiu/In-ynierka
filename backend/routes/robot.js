const express = require("express");
const router = express.Router();
const robotController = require("../controllers/robotController");

router.post("/create", robotController.createRobot);
router.get("/team/:username", robotController.getTeamRobots);
router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = {};
    if (categoryId) query.category = categoryId;
    const robots = await Robot.find(query).select("_id name category");
    res.json(robots);
  } catch (e) {
    res.status(500).json({ message: "Błąd pobierania robotów" });
  }
});
module.exports = router;
