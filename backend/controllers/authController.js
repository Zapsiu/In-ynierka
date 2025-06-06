const User = require("../models/User");

exports.register = async (req, res) => {
  const { username, password, firstName, lastName, age } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Użytkownik już istnieje" });
    }

    const user = new User({ username, password, firstName, lastName, age });
    await user.save();
    res.status(201).json({ message: "Użytkownik zarejestrowany" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera podczas rejestracji" });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    res.json({ message: "Zalogowano", token: "FAKE_TOKEN" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const username = req.headers["x-username"];
    if (!username) return res.status(401).json({ message: "Brak loginu" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    res.json({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      team: user.team,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera podczas pobierania profilu" });
  }
};