const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  a: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Robot",
    default: null
  },
  b: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Robot",
    default: null
  },
  winner: {
    type: String,
    default: null
  }
});

const PlayoffSchema = new mongoose.Schema(
  {
    size: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    seeds: [
      {
        seed: Number,
        robot: { type: mongoose.Schema.Types.ObjectId, ref: "Robot" },
        points: Number
      }
    ],
    round1: [MatchSchema],
    round2: [MatchSchema],
    final: MatchSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playoff", PlayoffSchema);
