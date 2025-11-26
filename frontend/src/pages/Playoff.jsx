import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchCategories } from "../api/categories";
import { fetchPlayoff } from "../api/playoff";
import SeedsCard from "../components/playoff/Seeds";
import Round from "../components/playoff/Round";

function msgFrom(e) {
  return e?.response?.data?.message || e?.message || String(e);
}

// Wspólna funkcja do nazywania rund – skopiuj też do JudgePanel
function labelForTeamsCount(teams) {
  if (teams <= 2) return "Finał";
  if (teams === 4) return "Półfinały";
  if (teams === 8) return "Ćwierćfinały";
  if (teams === 16) return "Top 16";
  if (teams === 32) return "Top 32";
  return `Top ${teams}`;
}

export default function Playoff() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [playoff, setPlayoff] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchCategories();
        setCategories(Array.isArray(list) ? list : []);
        if (list && list.length) {
          setCategoryId(list[0]._id);
        }
      } catch (e) {
        setErr(msgFrom(e));
      }
    })();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setPlayoff(null);
      return;
    }
    loadPlayoff(categoryId);
  }, [categoryId]);

  async function loadPlayoff(catId) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchPlayoff(catId);
      const p = res.playoff || res.data?.playoff || null;
      setPlayoff(p);
    } catch (e) {
      setErr(msgFrom(e));
    } finally {
      setLoading(false);
    }
  }

  // Budujemy listę rund w kolejności od NAJWCZEŚNIEJSZEJ do finału
  const rounds = [];
  const size = playoff?.size || (playoff?.seeds?.length ?? 0);

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

  // Nadajemy nazwy: Top 32 → Top 16 → Ćwierćfinały → Półfinały → Finał
  const titledRounds = rounds.map((r, idx) => {
    // idx = 0 → pierwsza runda (Top32 / Top16 / ćwierćfinały ...)
    // idx = ostatnia → finał
    const teamsAtStart =
      size && rounds.length ? size / Math.pow(2, idx) : null;

    const title = teamsAtStart
      ? labelForTeamsCount(teamsAtStart)
      : `Runda ${idx + 1}`;

    return { ...r, title };
  });

  return (
    <div className="profile-container" style={{ maxWidth: 1000 }}>
      <h2>Play-off</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <label>
          Kategoria:
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {(categories || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {err && <div className="notice error">{err}</div>}
      {loading && <div>Ładowanie…</div>}

      {!loading && !playoff && (
        <div className="card">
          Brak zapisanej drabinki dla tej kategorii. Poproś sędziego o
          wygenerowanie w panelu.
        </div>
      )}

      {!loading && playoff && (
        <div className="playoff-layout">
          <SeedsCard seeds={playoff.seeds || []} />

          <div className="grid" style={{ gap: 16 }}>
            {titledRounds.map((r) => (
              <Round key={r.key} title={r.title} matches={r.matches} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
