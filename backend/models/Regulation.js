const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", unique: true, required: true },
    text: { type: String, default: "" },
    pdfFileName: { type: String, default: "" },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Regulation", schema);