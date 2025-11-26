import { useState } from "react";
import { loginUser } from "../api/auth";
import "../AppStyles.css";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // login lub email
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError("");

    try {
      const res = await loginUser(identifier, password);
      localStorage.setItem("token", res.data.token || "FAKE_TOKEN");
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("role", res.data.user.role);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Błąd logowania.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="form">
      <h2>Logowanie</h2>

      <label>
        Login lub Email:
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          pattern="^(?:[A-Za-z0-9]+|[^@\s]+@[^@\s]+\.[^@\s]+)$"
          title="Podaj login (litery/cyfry) lub poprawny adres e-mail."
        />
      </label>

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

      <button type="submit">Zaloguj</button>
      {serverError && <p className="error">{serverError}</p>}
    </form>
  );
}
