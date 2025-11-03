const TeamsPublicList = ({ teams }) => (
  <>
    <h3>Dostępne drużyny:</h3>
    {teams.length === 0 ? (
      <p>Brak dostępnych drużyn.</p>
    ) : (
      <ul>
        {teams.map((team) => (
          <li key={team._id}>
            <strong>{team.teamName}</strong> ({team.members.length}/{team.limit || "?"})
          </li>
        ))}
      </ul>
    )}
  </>
);

export default TeamsPublicList;
