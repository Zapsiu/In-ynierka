import { useState } from "react";
import { registerUser } from "../api/auth";
import "../AppStyles.css";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await registerUser(username, password, firstName, lastName, parseInt(age));
      alert(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Błąd rejestracji.");
    }
  };

  return (
    <form onSubmit={handleRegister} className="form">
      <h2>Rejestracja</h2>

      <label>
        Login:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      <label>
        Hasło:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <label>
        Imię:
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </label>

      <label>
        Nazwisko:
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </label>

      <label>
        Wiek:
        <input
          type="number"
          min="1"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </label>

      <button type="submit">Zarejestruj</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
