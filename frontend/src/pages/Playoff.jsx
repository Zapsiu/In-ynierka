import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchPlayoff, generatePlayoff } from "../api/groups";
import JudgePlayoffPanel from "../components/playoff/JudgePlayoffPanel";
import SeedsCard from "../components/playoff/Seeds";
import RoundCard from "../components/playoff/Round";

export default function Playoff() {
  const [data, setData] = useState(null);
  const [size, setSize] = useState(8);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role") || "user";
  const me = localStorage.getItem("username") || "";
  const canJudge = role === "judge" || role === "admin";

  async function load() {
    setErr(null); setLoading(true);
    try {
      const { data } = await fetchPlayoff();
      setData(data.playoff || null);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd ładowania play-off");
    } finally { setLoading(false); }
  }

  async function onGenerate() {
    setErr(null); setMsg(null);
    try {
      const { data } = await generatePlayoff(me, Number(size) || 8);
      setData(data.playoff);
      setMsg("Wygenerowano drabinkę");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd generowania play-off");
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="profile-container">Ładowanie…</div>;

  return (
    <div className="profile-container" style={{ maxWidth: 900 }}>
      <h2>Play-off</h2>
      {msg && <div className="notice success">{msg}</div>}
      {err && <div className="notice error">{err}</div>}

      <JudgePlayoffPanel
        canJudge={canJudge}
        size={size}
        setSize={setSize}
        onGenerate={onGenerate}
        onRefresh={load}
      />

      {!data ? (
        <div className="card">Brak zapisanej drabinki. Poproś sędziego o wygenerowanie.</div>
      ) : (
        <>
          <SeedsCard seeds={data.seeds} />
          <RoundCard title="Runda 1" matches={data.round1 || []} />
        </>
      )}
    </div>
  );
}
