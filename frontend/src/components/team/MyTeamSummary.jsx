const MyTeamSummary = ({ team }) => {
  if (!team) return null;
  return (
    <>
      <h3>Twoja drużyna:</h3>
      <p>
        <strong>{team.teamName}</strong>{" "}
        {team.limit ? `(${team.members?.length || 0}/${team.limit})` : ""}
      </p>
      <p>Właściciel: <strong>{team.ownerId?.username || "—"}</strong></p>
      <h4>Członkowie:</h4>
      <ul>
        {(team.members || []).map((m) => (
          <li key={m._id || m.username}>{m.username || m}</li>
        ))}
      </ul>
    </>
  );
};

export default MyTeamSummary;
