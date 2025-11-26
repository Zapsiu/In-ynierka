const express = require("express");
const router = express.Router();
const robotController = require("../controllers/robotController");

router.post("/create", robotController.createRobot);
router.get("/team/:username", robotController.getTeamRobots);
router.get("/", robotController.listRobots);

module.exports = router;
