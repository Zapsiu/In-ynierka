const Round = ({ title, matches = [] }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      {matches.length === 0 ? (
        <p>Brak meczów.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {matches.map((m, i) => (
            <MatchRow key={i} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

function MatchRow({ match }) {
  const a = match.a || {};
  const b = match.b || {};
  const aTeam = a.team || {};
  const bTeam = b.team || {};
  const winner = match.winner || null; 

  const baseBox = {
    flex: 1,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.25)",
    fontSize: 14,
    minWidth: 0,
  };

  const winnerExtra = {
    background: "rgba(139,92,246,0.35)",
    boxShadow: "0 0 0 1px rgba(139,92,246,0.9)",
    fontWeight: 600,
  };

  const nameLine = (r, t) =>
    r && r.name
      ? `${r.name}${t.teamName ? ` (${t.teamName})` : ""}`
      : "(wolny los)";

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "stretch",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          ...baseBox,
          ...(winner === "a" ? winnerExtra : null),
        }}
      >
        {nameLine(a, aTeam)}
      </div>
      <div style={{ alignSelf: "center", fontSize: 13 }}>vs</div>
      <div
        style={{
          ...baseBox,
          ...(winner === "b" ? winnerExtra : null),
        }}
      >
        {nameLine(b, bTeam)}
      </div>
    </div>
  );
}

export default Round;
