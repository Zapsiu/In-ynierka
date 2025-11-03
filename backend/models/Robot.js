const mongoose = require("mongoose");

const robotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }
});

module.exports = mongoose.model("Robot", robotSchema);
