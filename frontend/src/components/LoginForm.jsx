import { useState } from "react";
import { loginUser } from "../api/auth";
import "../AppStyles.css";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser(username, password);
      localStorage.setItem("token", res.data.token || "FAKE_TOKEN");
      localStorage.setItem("username", username);
      localStorage.setItem("role", res.data.user.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Błąd logowania.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="form">
      <h2>Logowanie</h2>
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

      <button type="submit">Zaloguj</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
