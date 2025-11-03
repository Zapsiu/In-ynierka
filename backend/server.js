require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

async function connectDB(){
  try {
    await mongoose.connect("mongodb://localhost:27017/inzynierka");
    console.log("Połączono z MongoDB");
  } catch (error){
    console.log("Błąd połączenia z MongoDB");
  }
}
connectDB();

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
    }
  }
}));

app.use('/api/auth', require('./routes/auth'));
app.use("/api/team", require("./routes/team"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/robot", require("./routes/robot"));
app.use("/api/auth", require("./routes/auth"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/regulations", require("./routes/regulations"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/playoff", require("./routes/playoff")); 
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend działa na porcie ${PORT}`));