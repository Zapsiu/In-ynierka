import React from "react";

const GlobalTeamLimit = ({ value, onChange, onSave }) => {
  return (
    <>
      <h3 style={{ marginTop: "2rem" }}>Domyślny limit członków drużyny</h3>
      <label>
        Limit:
        <input
          type="number"
          min="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ marginLeft: "10px", width: "60px" }}
        />
      </label>
      <button onClick={onSave} style={{ marginLeft: "10px" }}>
        Zapisz limit
      </button>
    </>
  );
};

export default GlobalTeamLimit;
