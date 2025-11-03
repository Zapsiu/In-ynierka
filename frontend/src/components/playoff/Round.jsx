const Round = ({ title, matches = [] }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <ul className="list">
        {matches.map((m, i) => (
          <li key={i}>
            {m.a?.name}{m.a?.team?.teamName ? ` (${m.a.team.teamName})` : ""} <b>vs</b> {m.b?.name}{m.b?.team?.teamName ? ` (${m.b.team.teamName})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Round;
