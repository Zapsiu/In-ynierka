const express = require("express");
const router = express.Router();

const {
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  requireJudgeOrAdmin
} = require("../controllers/scheduleController");

router.get("/", getSchedule);

router.post("/", requireJudgeOrAdmin, createSchedule);

router.put("/:id", requireJudgeOrAdmin, updateSchedule);

router.delete("/:id", requireJudgeOrAdmin, deleteSchedule);

module.exports = router;
