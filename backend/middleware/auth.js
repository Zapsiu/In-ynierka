const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "tajny_klucz";

function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Brak tokenu" });

  try {
    const p = jwt.verify(token, JWT_SECRET);
    req.user = { id: p.id, username: p.username, role: p.role };
    next();
  } catch {
    return res.status(401).json({ message: "Nieprawidłowy token" });
  }
}

module.exports = { requireAuth };
