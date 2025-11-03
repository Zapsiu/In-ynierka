const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Robot", default: null },
  scores: [{
    robot:  { type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true },
    points: { type: Number, default: 0 },
    played: { type: Number, default: 0 },
    wins:   { type: Number, default: 0 },
    draws:  { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  }]
}, { timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);
