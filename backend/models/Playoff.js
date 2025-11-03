const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  a: { type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true },
  b: { type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true },
});

const PlayoffSchema = new mongoose.Schema({
  size: { type: Number, required: true },
  seeds: [{
    seed: Number,
    robot: { type: mongoose.Schema.Types.ObjectId, ref: "Robot" },
    points: Number,
  }],
  round1: [MatchSchema],
}, { timestamps: true });

module.exports = mongoose.model("Playoff", PlayoffSchema);
