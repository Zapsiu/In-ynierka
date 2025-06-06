const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

router.post("/", teamController.createTeam);
router.put("/:id/join", teamController.joinTeam);
router.get("/", teamController.getAllTeams);

module.exports = router;
