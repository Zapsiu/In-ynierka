const TeamSummary = ({ team }) => {
  if (!team) return <p><strong>Drużyna:</strong> Brak przypisanej</p>;
  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Drużyna: {team.teamName}</h3>
      <p><strong>Limit członków:</strong> {team.limit}</p>
      <p><strong>Członkowie:</strong></p>
      <ul>
        {team.members?.map((m) => (
          <li key={m._id}>{m.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default TeamSummary;
