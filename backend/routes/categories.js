const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Category = require("../models/Category");

const router = express.Router();

router.get("/", async (_req, res) => {
  const items = await Category.find().lean();
  res.json(items);
});

router.post("/create", async (req, res) => {
  const { name, description } = req.body || {};
  const item = await Category.create({ name, description });
  res.json(item);
});

const imgDir = path.join(__dirname, "..", "uploads", "images");
fs.mkdirSync(imgDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imgDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ storage });

router.post("/:id/image", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
  const cat = await Category.findById(id);
  if (!cat) return res.status(404).json({ message: "Category not found" });
  if (!req.file) return res.status(400).json({ message: "No file" });
  const rel = path.posix.join("uploads", "images", req.file.filename);
  const imageUrl = "/" + rel.replace(/\\/g, "/");
  cat.imageUrl = imageUrl;
  await cat.save();
  res.json({ imageUrl });
});

module.exports = router;