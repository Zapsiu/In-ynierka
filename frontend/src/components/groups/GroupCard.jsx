import React from "react";

const GroupCard = ({ group, canJudge, onScore }) => {
  return (
    <div className="card">
      <h3>{group.name}</h3>
      <ul className="list">
        {(group.members || []).map((r) => {
          const rid = typeof r === "string" ? r : r._id;
          const rname = typeof r === "string" ? r : r.name;
          const teamName = r?.team?.teamName ? ` (${r.team.teamName})` : "";
          const scoreEntry = (group.scores || []).find((s) => (s.robot?._id || s.robot) === rid);
          const pts = scoreEntry?.points || 0;
          const stat = scoreEntry ? ` (M:${scoreEntry.played} W:${scoreEntry.wins} R:${scoreEntry.draws} P:${scoreEntry.losses})` : "";
          return (
            <li key={rid} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
              <div>
                {rname}{teamName} — <b>{pts} pkt</b><span className="hint">{stat}</span>
              </div>
              {canJudge && (
                <div className="btn-group">
                  <button className="mini" onClick={() => onScore(group._id, rid, "win")}>+3 Wygrana</button>
                  <button className="mini" onClick={() => onScore(group._id, rid, "draw")}>+1 Remis</button>
                  <button className="mini" onClick={() => onScore(group._id, rid, "loss")}>0 Porażka</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GroupCard;
