const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  robot: { type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true },
  points: { type: Number, default: 0 },
  played: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
});

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Robot" }],
    scores: [ScoreSchema],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Robot",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
