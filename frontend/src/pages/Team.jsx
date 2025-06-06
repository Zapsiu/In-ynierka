import { useEffect, useState } from "react";
import { createTeam, joinTeam, getTeams } from "../api/team";
import "../AppStyles.css";

const Team = () => {
  const [teamName, setTeamName] = useState("");
  const [limit, setLimit] = useState(5);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const username = localStorage.getItem("username");

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await getTeams();
        setTeams(res.data);
      } catch (err) {
        console.error("Błąd ładowania drużyn:", err);
        setError("Błąd ładowania drużyn.");
      }
    };

    loadTeams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username) {
      setError("Nie jesteś zalogowany.");
      return;
    }

    try {
      const res = await createTeam(teamName, limit, username);
      setMessage(res.data.message);
      setTeamName("");
      setLimit(5);
      const teamsRes = await getTeams();
      setTeams(teamsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Błąd tworzenia drużyny.");
    }
  };

  const handleJoin = async (teamId) => {
    setError("");
    setMessage("");

    try {
      const res = await joinTeam(teamId, username);
      setMessage(res.data.message);
      const teamsRes = await getTeams();
      setTeams(teamsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Nie udało się dołączyć do drużyny.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Zarządzanie drużyną</h2>

      <form onSubmit={handleCreate} className="form">
        <label>
          Nazwa drużyny:
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </label>

        <label>
          Limit członków:
          <input
            type="number"
            min="1"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            required
          />
        </label>

        <button type="submit">Utwórz drużynę</button>
      </form>

      {message && <p style={{ color: "lightgreen" }}>{message}</p>}
      {error && <p className="error">{error}</p>}

      <h3>Dostępne drużyny:</h3>
      {teams.length === 0 ? (
        <p>Brak dostępnych drużyn.</p>
      ) : (
        <ul>
          {teams.map((team) => (
            <li key={team._id}>
              <strong>{team.name}</strong> ({team.members.length}/{team.limit})
              <button
                onClick={() => handleJoin(team._id)}
                className="nav-button"
                style={{ marginLeft: 10 }}
              >
                Dołącz
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Team;
