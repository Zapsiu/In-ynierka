import React from "react";

const JudgeCategoriesPanel = ({ canJudge, size, setSize, onGenerate, onReset, onRefresh }) => {
  if (!canJudge) return null;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>Panel sędziego</h3>
      <div className="grid" style={{ gridTemplateColumns: "220px auto", gap: 12 }}>
        <label>
          <span>Rozmiar grupy</span>
          <input type="number" min={2} value={size} onChange={(e) => setSize(e.target.value)} />
        </label>
      </div>
      <div className="actions" style={{ marginTop: 8 }}>
        <button className="primary" onClick={onGenerate}>Wygeneruj grupy</button>
        <button onClick={onReset}>Resetuj</button>
        <button onClick={onRefresh}>Odśwież</button>
      </div>
    </div>
  );
};

export default JudgeCategoriesPanel;
