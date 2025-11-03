const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

router.post("/create", teamController.createTeam);
// router.post("/join/:id", teamController.joinTeam); // ⛔️ wyłączamy samodzielne dołączanie
router.post("/leave", teamController.leaveTeam);
router.get("/", teamController.getAllTeams);

router.post("/add-member", teamController.addMemberByUsername);
router.get("/by-user/:username", teamController.getTeamByUsername);

module.exports = router;
