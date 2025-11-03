import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchGroups, generateGroups, resetGroups, addScore } from "../api/groups";
import JudgePanel from "../components/groups/JudgeCategoriesPanel";
import GroupCard from "../components/groups/GroupCard";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(4);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const username = localStorage.getItem("username") || "";
  const role = localStorage.getItem("role") || "user";
  const canJudge = role === "judge" || role === "admin";

  async function load() {
    setErr(null);
    try {
      const { data } = await fetchGroups();
      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd ładowania grup");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onGenerate() {
    setErr(null); setMsg(null);
    try {
      await generateGroups(username, { size: Number(size) || 4 });
      setMsg("Wygenerowano grupy");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd generowania");
    }
  }

  async function onReset() {
    if (!confirm("Na pewno zresetować wszystkie grupy?")) return;
    setErr(null); setMsg(null);
    try {
      await resetGroups(username);
      setMsg("Zresetowano grupy");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd resetu");
    }
  }

  async function onScore(gid, rid, result) {
    setErr(null);
    try {
      await addScore(username, gid, rid, result);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd zapisu punktów");
    }
  }

  if (loading) return <div className="profile-container">Ładowanie…</div>;

  return (
    <div className="profile-container" style={{ maxWidth: 1000 }}>
      <h2>Grupy</h2>

      {msg && <div className="notice success">{msg}</div>}
      {err && <div className="notice error">{err}</div>}

      <JudgePanel
        canJudge={canJudge}
        size={size}
        setSize={setSize}
        onGenerate={onGenerate}
        onReset={onReset}
        onRefresh={load}
      />

      {groups.length === 0 ? (
        <div className="card">Brak grup.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {groups.map((g) => (
            <GroupCard key={g._id} group={g} canJudge={canJudge} onScore={onScore} />
          ))}
        </div>
      )}
    </div>
  );
}
