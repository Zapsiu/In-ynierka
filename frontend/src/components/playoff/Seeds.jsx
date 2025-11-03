const Seeds = ({ seeds = [] }) => {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3>Rozstawienie</h3>
      <ol>
        {seeds.map((s, i) => (
          <li key={i}>
            #{s.seed} — {s.robot?.name}{s.robot?.team?.teamName ? ` (${s.robot.team.teamName})` : ""} — {s.points} pkt
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Seeds;
