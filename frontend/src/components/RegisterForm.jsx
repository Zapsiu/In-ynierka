import { useState } from "react";
import { registerUser, loginUser } from "../api/auth";
import "../AppStyles.css";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");

    try {
      const res = await registerUser(
        username,
        password,
        firstName,
        lastName,
        parseInt(age, 10),
        email
      );
      alert(res.data.message);

      const loginRes = await loginUser(username, password);
      localStorage.setItem("token", loginRes.data.token || "FAKE_TOKEN");
      localStorage.setItem("username", username);
      localStorage.setItem("role", loginRes.data.user.role);

      navigate("/");
    } catch (err) {
      console.error("Błąd rejestracji lub logowania:", err);
      setServerError(err.response?.data?.message || "Błąd rejestracji.");
    }
  };

  return (
    <form onSubmit={handleRegister} className="form">
      <h2>Rejestracja</h2>

      {/* LOGIN */}
      <label>
        Login:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          pattern="^[A-Za-z0-9]{3,}$"
          title="Login musi mieć minimum 3 znaki i może zawierać tylko litery i cyfry."
        />
      </label>

      {/* HASŁO + oczko */}
      <label>
        Hasło:
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            title="Hasło musi mieć minimum 6 znaków."
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </label>

      {/* IMIĘ */}
      <label>
        Imię:
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          title="Podaj swoje imię."
        />
      </label>

      {/* NAZWISKO */}
      <label>
        Nazwisko:
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          title="Podaj swoje nazwisko."
        />
      </label>

      {/* WIEK */}
      <label>
        Wiek:
        <input
          type="number"
          min="1"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          title="Podaj poprawny wiek (1–120)."
        />
      </label>

      {/* EMAIL */}
      <label>
        E-mail:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          title="Podaj poprawny adres e-mail."
        />
      </label>

      <button type="submit">Zarejestruj</button>
      {serverError && <p className="error">{serverError}</p>}
    </form>
  );
}
