const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  defaultTeamLimit: {
    type: Number,
    required: true,
    default: 5
  }
});

module.exports = mongoose.model("Settings", settingsSchema);
