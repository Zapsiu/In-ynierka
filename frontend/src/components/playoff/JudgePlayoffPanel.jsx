const JudgePlayoffPanel = ({
  canJudge,
  size,
  setSize,
  categories,
  categoryId,
  setCategoryId,
  onGenerate,
  onRefresh
}) => {
  if (!canJudge) return null;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>Panel sędziego</h3>
      <div className="actions" style={{ gap: 8, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Kategoria</span>
          <select
            value={categoryId || ""}
            onChange={e => setCategoryId(e.target.value)}
          >
            <option value="">Wybierz kategorię</option>
            {(categories || []).map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>TOP-N</span>
          <input
            type="number"
            min={2}
            max={128}
            value={size}
            onChange={e => setSize(e.target.value)}
          />
        </label>
        <button
          className="primary"
          onClick={onGenerate}
          disabled={!categoryId}
        >
          Generuj play-off
        </button>
        <button onClick={onRefresh}>Odśwież</button>
      </div>
      <p className="hint">
        Generować może tylko rola <b>judge</b> lub <b>admin</b>.
      </p>
    </div>
  );
};

export default JudgePlayoffPanel;
