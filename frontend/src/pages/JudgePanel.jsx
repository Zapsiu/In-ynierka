import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchCategories, createCategory } from "../api/categories";
import {
  fetchGroups,
  generateGroups,
  resetGroups,
  addScore
} from "../api/groups";
import {
  fetchPlayoff,
  generatePlayoff,
  updatePlayoffMatch
} from "../api/playoff";
import CategoryForm from "../components/categories/CategoryForm";
import CategoriesList from "../components/categories/CategoriesList";
import SeedsCard from "../components/playoff/Seeds";

function labelForTeamsCount(teams) {
  if (teams <= 2) return "Finał";
  if (teams === 4) return "Półfinały";
  if (teams === 8) return "Ćwierćfinały";
  if (teams === 16) return "Top 16";
  if (teams === 32) return "Top 32";
  return `Top ${teams}`;
}

export default function JudgePanel() {
  const [tab, setTab] = useState("categories");

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [groups, setGroups] = useState([]);
  const [playoff, setPlayoff] = useState(null);

  const [groupCount, setGroupCount] = useState(4);
  const [playoffSize, setPlayoffSize] = useState(8);

  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchCategories();
        setCategories(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length) {
          setSelectedCategoryId(list[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    loadGroups(selectedCategoryId);
    loadPlayoff(selectedCategoryId);
  }, [selectedCategoryId]);

  async function loadGroups(categoryId) {
    try {
      const data = await fetchGroups(categoryId);
      setGroups(data.groups || []);
    } catch (e) {
      console.error("Błąd pobierania grup:", e);
    }
  }

  async function loadPlayoff(categoryId) {
    try {
      const data = await fetchPlayoff(categoryId);
      setPlayoff(data.playoff || null);
    } catch (e) {
      console.error("Błąd pobierania play-off:", e);
    }
  }

  async function handleCreateCategory(payload) {
    setMsg(null);
    setErr(null);
    try {
      const res = await createCategory(payload);
      setMsg(res?.message || "Dodano kategorię");
      const list = await fetchCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch (e) {
      const m = e?.response?.data?.message || e.message || String(e);
      setErr(m);
    }
  }

  async function handleGenerateGroups() {
    setMsg(null);
    setErr(null);
    try {
      await generateGroups(groupCount, selectedCategoryId);
      await loadGroups(selectedCategoryId);
    } catch (e) {
      const m = e.message || String(e);
      setErr(m);
    }
  }

  async function handleResetGroups() {
    setMsg(null);
    setErr(null);
    try {
      await resetGroups(selectedCategoryId);
      await loadGroups(selectedCategoryId);
      setMsg("Zresetowano grupy dla kategorii");
    } catch (e) {
      const m = e.message || String(e);
      setErr(m);
    }
  }

async function handleScoreUpdate(groupId, robotId, result, delta = "inc") {
  setMsg(null);
  setErr(null);
  try {
    await addScore(groupId, robotId, result, delta);
    await loadGroups(selectedCategoryId);
  } catch (e) {
    const m = e.message || String(e);
    setErr(m);
  }
}


  async function handleGeneratePlayoff() {
    setMsg(null);
    setErr(null);
    try {
      const data = await generatePlayoff(
        Number(playoffSize) || 8,
        selectedCategoryId
      );
      setPlayoff(data.playoff || null);
    } catch (e) {
      const m = e.message || String(e);
      setErr(m);
    }
  }

  async function handlePickWinner(roundName, index, side) {
    if (!playoff?._id) return;
    setMsg(null);
    setErr(null);
    try {
      const data = await updatePlayoffMatch(playoff._id, {
        round: roundName,
        index,
        winner: side
      });
      setPlayoff(data.playoff || null);
      setMsg("Zapisano wynik meczu");
    } catch (e) {
      const m = e.message || String(e);
      setErr(m);
    }
  }

  const renderCategorySelector = () => (
    <div style={{ marginBottom: 12 }}>
      <label>
        Kategoria:
        <select
          value={selectedCategoryId || ""}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="card" style={{ gap: 15 }}>
      {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}
      {err && <p style={{ color: "salmon" }}>{err}</p>}
      <CategoryForm onCreate={handleCreateCategory} />
      <CategoriesList categories={categories} />
    </div>
  );

  const renderGroupsTab = () => (
    <div className="card" style={{ gap: 16 }}>
      {renderCategorySelector()}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 8,
          alignItems: "center"
        }}
      >
        <h3 style={{ margin: 0 }}>Grupy</h3>
        <span>Liczba robotów w grupie:</span>
        <input
          type="number"
          min={1}
          value={groupCount}
          onChange={(e) => setGroupCount(Number(e.target.value) || 1)}
          style={{ width: 70 }}
        />
        <button onClick={handleGenerateGroups} className="btn-primary">
          Generuj grupy
        </button>
        <button onClick={handleResetGroups} className="btn-secondary">
          Resetuj grupy
        </button>
      </div>

      {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}
      {err && <p style={{ color: "salmon" }}>{err}</p>}

      {groups.length === 0 && <p>Brak grup.</p>}

      {groups.map((g) => (
        <div key={g._id} className="card" style={{ marginBottom: 12 }}>
          <h4>{g.name}</h4>
          <div style={{ overflowX: "auto" }}>
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Robot</th>
                  <th>Drużyna</th>
                  <th>Mecze</th>
                  <th>W</th>
                  <th>R</th>
                  <th>P</th>
                  <th>Punkty</th>
                  <th>Akcja</th>
                </tr>
              </thead>
              <tbody>
                {(g.scores || []).map((s) => {
                  const robot = s.robot || {};
                  const team = robot.team || {};
                  return (
                    <tr key={robot._id || Math.random()}>
                      <td>{robot.name || "?"}</td>
                      <td>{team.teamName || "-"}</td>
                      <td>{s.played ?? 0}</td>
                      <td>{s.wins ?? 0}</td>
                      <td>{s.draws ?? 0}</td>
                      <td>{s.losses ?? 0}</td>
                      <td>{s.points ?? 0}</td>
                      <td>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4
    }}
  >
    <div style={{ display: "flex", gap: 4 }}>
      <button
        className="btn-small"
        onClick={() =>
          handleScoreUpdate(g._id, robot._id, "win", "inc")
        }
      >
        W
      </button>
      <button
        className="btn-small"
        onClick={() =>
          handleScoreUpdate(g._id, robot._id, "draw", "inc")
        }
      >
        R
      </button>
      <button
        className="btn-small"
        onClick={() =>
          handleScoreUpdate(g._id, robot._id, "loss", "inc")
        }
      >
        P
      </button>
    </div>

    <div style={{ display: "flex", gap: 4 }}>
      <button
        className="btn-small"
        onClick={() =>
          handleScoreUpdate(g._id, robot._id, "win", "dec")
        }
      >
        -W
      </button>
      <button
        className="btn-small"
        onClick={() =>
          handleScoreUpdate(g._id, robot._id, "draw", "dec")
        }
      >
        -R
      </button>
      <button
        className="btn-small"
        onClick={() =>
          handleScoreUpdate(g._id, robot._id, "loss", "dec")
        }
      >
        -P
      </button>
    </div>
  </div>
</td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlayoffTab = () => {
    const size = playoff?.size || (playoff?.seeds?.length ?? 0);

    const rounds = [];
    if (playoff?.round1 && playoff.round1.length) {
      rounds.push({ key: "round1", matches: playoff.round1 });
    }
    if (playoff?.round2 && playoff.round2.length) {
      rounds.push({ key: "round2", matches: playoff.round2 });
    }
    if (playoff?.round3 && playoff.round3.length) {
      rounds.push({ key: "round3", matches: playoff.round3 });
    }
    if (playoff?.round4 && playoff.round4.length) {
      rounds.push({ key: "round4", matches: playoff.round4 });
    }
    if (playoff?.final && (playoff.final.a || playoff.final.b)) {
      rounds.push({ key: "final", matches: [playoff.final] });
    }

    const titledRounds = rounds.map((r, idx) => {
      const teamsAtStart =
        size && rounds.length ? size / Math.pow(2, idx) : null;
      const title = teamsAtStart
        ? labelForTeamsCount(teamsAtStart)
        : `Runda ${idx + 1}`;
      return { ...r, title };
    });

    return (
      <div className="card" style={{ gap: 16 }}>
        {renderCategorySelector()}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8
          }}
        >
          <h3 style={{ margin: 0 }}>Play-off</h3>
          <span>Rozmiar drabinki (TOP-N, potęga 2):</span>
          <input
            type="number"
            min={2}
            max={128}
            step={2}
            value={playoffSize}
            onChange={(e) => setPlayoffSize(e.target.value)}
            style={{ width: 80 }}
          />
          <button onClick={handleGeneratePlayoff} className="btn-primary">
            Generuj z tabeli grup
          </button>
        </div>

        {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}
        {err && <p style={{ color: "salmon" }}>{err}</p>}

        {!playoff ? (
          <div className="card">
            Brak zapisanej drabinki. Wygeneruj ją na podstawie wyników grup
            wybranej kategorii.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 16,
              alignItems: "flex-start"
            }}
          >
            <div>
              <SeedsCard seeds={playoff.seeds || []} />
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {titledRounds.map((r) => (
                <RoundView
                  key={r.key}
                  title={r.title}
                  matches={r.matches}
                  roundName={r.key}
                  onPickWinner={handlePickWinner}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-container">
      <h2>Panel sędziego</h2>

      <div className="card" style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button
          className={tab === "categories" ? "tab-active" : "tab"}
          onClick={() => setTab("categories")}
        >
          Kategorie
        </button>
        <button
          className={tab === "groups" ? "tab-active" : "tab"}
          onClick={() => setTab("groups")}
        >
          Grupy
        </button>
        <button
          className={tab === "playoff" ? "tab-active" : "tab"}
          onClick={() => setTab("playoff")}
        >
          Play-off
        </button>
      </div>

      {tab === "categories" && renderCategoriesTab()}
      {tab === "groups" && renderGroupsTab()}
      {tab === "playoff" && renderPlayoffTab()}
    </div>
  );
}

function RoundView({ title, matches, roundName, onPickWinner }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="card" style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {matches.map((m, idx) => (
          <MatchRow
            key={idx}
            match={m}
            index={idx}
            roundName={roundName}
            onPickWinner={onPickWinner}
          />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match, index, roundName, onPickWinner }) {
  const a = match.a || {};
  const b = match.b || {};
  const aTeam = a.team || {};
  const bTeam = b.team || {};
  const winner = match.winner || null;

  const cellStyle = (side) => ({
    flex: 1,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      winner === side ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.02)",
    cursor: "pointer"
  });

  const nameLine = (r, t) =>
    r && r.name
      ? `${r.name} ${t.teamName ? `(${t.teamName})` : ""}`
      : "(wolny los)";

  const click = (side) => {
    if (!onPickWinner) return;
    onPickWinner(roundName, index, side);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={cellStyle("a")} onClick={() => click("a")}>
        <strong>{nameLine(a, aTeam)}</strong>
      </div>
      <div style={{ alignSelf: "center" }}>vs</div>
      <div style={cellStyle("b")} onClick={() => click("b")}>
        <strong>{nameLine(b, bTeam)}</strong>
      </div>
    </div>
  );
}
