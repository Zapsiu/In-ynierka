import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchCategories } from "../api/categories";
import { fetchGroups } from "../api/groups";
import GroupCard from "../components/groups/GroupCard";

function msgFrom(e) {
  return e?.response?.data?.message || e?.message || String(e);
}

export default function Groups() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [groups, setGroups] = useState([]);
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
      setGroups([]);
      return;
    }
    loadGroups(categoryId);
  }, [categoryId]);

  async function loadGroups(catId) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchGroups(catId);
      const list = res.groups || res.data?.groups || [];
      setGroups(list);
    } catch (e) {
      setErr(msgFrom(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-container">
      <h2>Grupy</h2>

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
      {loading && <p>Ładowanie…</p>}

      {!loading && groups.length === 0 && !err && (
        <div className="card">Brak grup dla tej kategorii.</div>
      )}

      <div className="grid" style={{ gap: 16 }}>
        {groups.map((g) => (
          <GroupCard
            key={g._id}
            group={g}
            canJudge={false}   // wymusza tryb tylko-do-odczytu w GroupCard
            onScore={() => {}} // przekazujemy pustą funkcję, żeby nic nie robiło
          />
        ))}
      </div>
    </div>
  );
}
