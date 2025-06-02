import { useState } from "react";
import axios from "axios";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      alert(res.data.message);
    } catch (err) {
      alert("Błąd logowania");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Login" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło" />
      <button type="submit">Zaloguj</button>
    </form>
  );
}
   