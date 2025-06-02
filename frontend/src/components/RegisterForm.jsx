// frontend/src/components/RegisterForm.jsx
import { useState } from "react";
import axios from "axios";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        username,
        password,
      });
      alert(res.data.message);
    } catch (err) {
      alert("Błąd rejestracji");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Login" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" />
      <button type="submit">Zarejestruj</button>
    </form>
  );
}
