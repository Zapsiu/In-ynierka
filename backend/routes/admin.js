const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController"); // lub adminController

router.delete("/delete-category/:categoryId", adminController.deleteCategory);
router.delete("/delete-team/:teamId", adminController.deleteTeam);
router.get("/users", async (req, res) => {
  const users = await require("../models/User").find({}, "username role");
  res.json(users);
});

router.post("/change-role", adminController.updateUserRole);

router.get("/teams", async (req, res) => {
  const teams = await require("../models/Team").find().populate("members", "username");
  res.json(teams);
});
router.get("/team-limit", adminController.getDefaultTeamLimit);
router.post("/team-limit", adminController.setDefaultTeamLimit);
router.post("/remove-member", adminController.removeMemberFromTeam);
router.post("/update-team-limit", adminController.updateTeamLimit);
router.delete("/delete-robot/:robotId", adminController.deleteRobot);
router.delete("/delete-user/:username", adminController.deleteUser);

router.get("/robots", async (req, res) => {
  const Robot = require("../models/Robot");
  try {
    const robots = await Robot.find();
    res.json(robots);
  } catch (err) {
    res.status(500).json({ message: "Błąd pobierania robotów" });
  }
});

module.exports = router;
