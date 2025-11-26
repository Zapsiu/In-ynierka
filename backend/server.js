require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

app.set('io', io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub || payload.id || payload._id;
    if (!userId) return next(new Error('Invalid payload'));
    socket.user = { id: userId, role: payload.role };
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  if (socket.user?.id) {
    socket.join(`user:${socket.user.id}`);
  }
  socket.on("joinConversation", (conversationId) => {
    socket.join(String(conversationId));
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(String(conversationId));
  });
});

async function connectDB(){
  try {
    await mongoose.connect("mongodb://localhost:27017/inzynierka");
    console.log("Połączono z MongoDB");
  } catch (error){
    console.log("Błąd połączenia z MongoDB");
  }
}
connectDB();

app.use(cors());
app.use(express.json());

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
app.use("/api/notifications", require("./routes/notifications"));
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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/schedule", require("./routes/schedule"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend działa na porcie ${PORT}`));
