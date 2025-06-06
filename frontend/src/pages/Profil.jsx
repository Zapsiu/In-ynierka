import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../api/auth";
import "../AppStyles.css";

const Profil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      navigate("/logowanie");
      return;
    }

    getProfile(username)
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Błąd pobierania profilu:", err);
        navigate("/logowanie");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/logowanie");
    window.location.reload();
  };

  if (!user) {
    return <div className="profile-container">Ładowanie profilu...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Witaj, {user.firstName}!</h2>
      <p><strong>Login:</strong> {user.username}</p>
      <p><strong>Imię:</strong> {user.firstName}</p>
      <p><strong>Nazwisko:</strong> {user.lastName}</p>
      <p><strong>Wiek:</strong> {user.age}</p>
      <p><strong>Drużyna:</strong> {user.team ?? "Brak przypisanej"}</p>
      <button onClick={handleLogout} className="logout-button">Wyloguj</button>
    </div>
  );
};

export default Profil;
