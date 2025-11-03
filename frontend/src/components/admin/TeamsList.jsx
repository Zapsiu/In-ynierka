import React from "react";

const TeamsList = ({
  teams,
  onLocalLimitChange,
  onSaveLimit,
  onRemoveMember,
  onDeleteTeam,
}) => {
  return (
    <>
      <h3 style={{ marginTop: "2rem" }}>Drużyny</h3>
      {teams.map((team) => (
        <div key={team._id} style={{ borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
          <p><strong>{team.teamName}</strong></p>
          <p>Limit: {team.limit}</p>
          <p>Członkowie:</p>
          <ul>
            {team.members.map((member) => (
              <li key={member._id}>
                {member.username}
                <button
                  onClick={() => onRemoveMember(team._id, member.username)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  Usuń
                </button>
              </li>
            ))}
          </ul>
          <label>
            Zmień limit:
            <input
              type="number"
              min="1"
              value={team.newLimit}
              onChange={(e) => onLocalLimitChange(team._id, e.target.value)}
              style={{ marginLeft: "10px", width: "60px" }}
            />
          </label>
          <button onClick={() => onSaveLimit(team._id, team.newLimit)} style={{ marginLeft: "10px" }}>
            Zapisz
          </button>
          <button
            onClick={() => onDeleteTeam(team._id)}
            style={{ marginLeft: "10px", backgroundColor: "darkred", color: "white" }}
          >
            Usuń drużynę
          </button>
        </div>
      ))}
    </>
  );
};

export default TeamsList;
