const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Regulation = require("../models/Regulation");
const Category = require("../models/Category");

const router = express.Router();

const pdfDir = path.join(__dirname, "..", "uploads", "pdfs");
fs.mkdirSync(pdfDir, { recursive: true });
function makeAbsolute(req, maybeRelative) {
  if (!maybeRelative) return "";
  // jeśli już jest absolutny, zostaw
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  // zbuduj pełny URL
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pdfDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ storage });

router.get("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.isValidObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });

  const cat = await Category.findById(categoryId).lean();
  if (!cat) return res.status(404).json({ message: "Category not found" });

  const reg = await Regulation.findOne({ category: categoryId }).lean();
  if (!reg) {
    return res.json({ text: "", pdfUrl: "", pdfFileName: "", updatedAt: null, categoryName: cat.name });
  }

  res.json({
    text: reg.text || "",
    pdfUrl: makeAbsolute(req, reg.pdfUrl || ""),     // ⬅⬅ tu
    pdfFileName: reg.pdfFileName || "",
    updatedAt: reg.updatedAt,
    categoryName: cat.name
  });
});

router.post("/:categoryId", upload.single("pdf"), async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.isValidObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });

  const cat = await Category.findById(categoryId);
  if (!cat) return res.status(404).json({ message: "Category not found" });

  const text = typeof req.body.text === "string" ? req.body.text : "";

  let pdfUrl;
  let pdfFileName;
  if (req.file) {
    const rel = path.posix.join("uploads", "pdfs", req.file.filename);
    pdfUrl = "/" + rel.replace(/\\/g, "/");
    pdfFileName = req.file.originalname;
  }

  const update = { text };
  if (pdfUrl) update.pdfUrl = pdfUrl;
  if (pdfFileName) update.pdfFileName = pdfFileName;

  const reg = await Regulation.findOneAndUpdate(
    { category: categoryId },
    { $set: update, $setOnInsert: { category: categoryId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  res.json({
    text: reg.text || "",
    pdfUrl: makeAbsolute(req, reg.pdfUrl || ""),     // ⬅⬅ tu
    pdfFileName: reg.pdfFileName || "",
    updatedAt: reg.updatedAt,
    categoryName: cat.name
  });
});

module.exports = router;
