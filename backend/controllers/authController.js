const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "tajny_klucz"; 

exports.register = async (req, res) => {
  const { username, password, firstName, lastName, age, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Użytkownik już istnieje" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email jest już zajęty" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      email,
      role: "user",
      team: null
    });

    await user.save();
    return res.status(201).json({ message: "Użytkownik zarejestrowany" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Błąd serwera podczas rejestracji" });
  }
};

exports.login = async (req, res) => {
  const { username, identifier, password } = req.body;

  try {
    const loginId = identifier || username;
    if (!loginId || !password) {
      return res.status(400).json({ message: "Brak loginu/e-maila lub hasła" });
    }

    const user = await User.findOne({
      $or: [{ username: loginId }, { email: loginId }]
    });

    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || JWT_SECRET,   
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Zalogowano",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        team: user.team
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.getProfile = async (req, res) => {
  const username = req.headers["x-username"];
  if (!username) return res.status(400).json({ message: "Brak nagłówka x-username" });

  try {
    const user = await User.findOne({ username }).populate({
      path: "team",
      populate: { path: "members", select: "username" }
    });
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    return res.json({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      email: user.email,
      team: user.team,
      role: user.role
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return res.status(500).json({ message: "Błąd serwera podczas pobierania profilu" });
  }
};

exports.updateProfile = async (req, res) => {
  const username = req.headers["x-username"];
  if (!username) return res.status(400).json({ message: "Brak nagłówka x-username" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    const { newUsername, email, firstName, lastName, age } = req.body || {};

    const updates = {};
    if (typeof firstName === "string") updates.firstName = firstName.trim();
    if (typeof lastName === "string") updates.lastName = lastName.trim();
    if (typeof age !== "undefined") updates.age = Number(age);
    if (typeof email === "string") updates.email = email.trim();
    if (typeof newUsername === "string") updates.username = newUsername.trim();

    if (updates.email) {
      const existsEmail = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
      if (existsEmail) return res.status(409).json({ message: "Email jest już zajęty" });
    }
    if (updates.username) {
      const existsUser = await User.findOne({ username: updates.username, _id: { $ne: user._id } });
      if (existsUser) return res.status(409).json({ message: "Nazwa użytkownika jest już zajęta" });
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true }).populate({
      path: "team",
      populate: { path: "members", select: "username" }
    });

    return res.json({
      username: updated.username,
      firstName: updated.firstName,
      lastName: updated.lastName,
      age: updated.age,
      email: updated.email,
      team: updated.team,
      role: updated.role
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Błąd serwera podczas aktualizacji profilu" });
  }
};

exports.changePasswordProfile = async (req, res) => {
  const username = req.headers["x-username"];
  if (!username) return res.status(400).json({ message: "Brak nagłówka x-username" });

  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Brak wymaganych pól" });
    if (newPassword.length < 8)
      return res.status(400).json({ message: "Nowe hasło musi mieć min. 8 znaków" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Błędne aktualne hasło" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Hasło zmienione" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Błąd serwera przy zmianie hasła" });
  }
};
