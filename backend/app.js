const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express(); 
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = [];

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "Użytkownik już istnieje" });
  }
  users.push({ username, password });
  res.status(201).json({ message: "Zarejestrowano" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
  res.json({ message: "Zalogowano", user });
});

io.on("connection", (socket) => {
  console.log("Połączono z klientem:", socket.id);

  socket.on("disconnect", () => {
    console.log("Rozłączono:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("✅ Backend działa na http://localhost:5000");
});
