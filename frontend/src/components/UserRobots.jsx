import { useEffect, useState } from "react";
import axios from "axios";
import "../AppStyles.css";

const UserRobots = () => {
  const [robots, setRobots] = useState([]);
  const [robotName, setRobotName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const username = localStorage.getItem("username");

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/profil", {
        headers: { "x-username": username }
      });
      const userTeam = res.data.team;
      if (userTeam && userTeam.ownerId === res.data.username) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (err) {
      console.error("Błąd pobierania profilu:", err);
    }
  };

  const fetchRobots = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/robots/team/${username}`);
      setRobots(res.data);
    } catch (err) {
      console.error("Błąd ładowania robotów:", err);
      setError("Nie udało się pobrać robotów.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Błąd ładowania kategorii:", err);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchRobots();
      fetchCategories();
    }
  }, [username]);

  const handleCreateRobot = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/robots/create", {
        username,
        robotName
      });
      setMessage(res.data.message);
      setRobotName("");
      fetchRobots();
    } catch (err) {
      console.error("Błąd tworzenia robota:", err);
      setError(err.response?.data?.message || "Błąd tworzenia robota.");
    }
  };

  const handleAssignCategory = async (robotId, categoryId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/categories/assign-robot", {
        robotId,
        categoryId
      });
      setMessage(res.data.message);
      fetchRobots();
    } catch (err) {
      console.error("Błąd przypisywania kategorii:", err);
      setError("Błąd przypisywania kategorii.");
    }
  };

  if (!isOwner) {
    return (
      <div className="profile-container">
        <h2>Moje Roboty</h2>
        <p>Tylko właściciel drużyny może zarządzać robotami drużyny.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Roboty Twojej drużyny</h2>

      <form onSubmit={handleCreateRobot} className="form">
        <label>
          Nazwa robota:
          <input
            type="text"
            value={robotName}
            onChange={(e) => setRobotName(e.target.value)}
            required
          />
        </label>
        <button type="submit">Dodaj robota</button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p className="error">{error}</p>}

      <h3>Lista robotów</h3>
      <ul>
        {robots.map((robot) => (
          <li key={robot._id} style={{ marginBottom: "1rem" }}>
            <strong>{robot.name}</strong>{" "}
            {robot.category ? (
              <span>(Kategoria: {robot.category.name})</span>
            ) : (
              <>
                <span>– brak kategorii</span>
                <div>
                  <select
                    defaultValue=""
                    onChange={(e) => handleAssignCategory(robot._id, e.target.value)}
                  >
                    <option value="" disabled>Wybierz kategorię</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRobots;
