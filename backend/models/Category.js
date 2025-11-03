const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  robots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Robot" }],
  imageUrl: { type: String, default: "" }
});

module.exports = mongoose.model("Category", categorySchema);