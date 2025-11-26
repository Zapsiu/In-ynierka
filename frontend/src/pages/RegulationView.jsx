import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getRegulation, saveRegulation } from "../api/regulations";
import { fetchCategories, updateCategoryName } from "../api/categories";
import RegulationContent from "../components/regulation/RegulationContent";

export default function RegulationView() {
  const { id } = useParams();

  const [name, setName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [data, setData] = useState({ text: "", pdfUrl: "", pdfFileName: "", updatedAt: "" });
  const [draftText, setDraftText] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const role = useMemo(() => localStorage.getItem("role"), []);
  const canEdit = ["admin", "judge"].includes(role);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const cats = await fetchCategories();
        const c = cats.find((x) => x._id === id);
        if (live) {
          const nm = c?.name || "Regulamin";
          setName(nm);
          setDraftName(nm);
        }
      } catch {}
      try {
        const r = await getRegulation(id);
        if (live) {
          setData(r);
          setDraftText(r.text || "");
        }
      } catch (e) {
        if (live) setErr(e?.response?.data?.message || e.message || "Błąd");
      }
    })();
    return () => { live = false; };
  }, [id]);

  const handleSaveName = async () => {
    const v = (draftName || "").trim();
    if (!v) return setErr("Nazwa nie może być pusta.");
    setSavingName(true); setErr("");
    try {
      const res = await updateCategoryName(id, v);
      setName(res.category.name);
      setEditingName(false);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Nie udało się zapisać nazwy.");
    } finally { setSavingName(false); }
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/\.pdf$/i.test(f.name)) return setErr("Wgraj plik PDF.");
    if (f.size > 20 * 1024 * 1024) return setErr("Plik większy niż 20 MB.");
    setFile(f);
  };

  const handleSaveReg = async () => {
    setSaving(true); setErr("");
    try {
      const saved = await saveRegulation(id, { text: draftText, file });
      setData(saved);
      setFile(null);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Nie udało się zapisać.");
    } finally { setSaving(false); }
  };

  return (
    <main className="reg-page">
      {/* HEADER */}
      <div className="card">
        <div className="card-body reg-header">
          {!editingName ? (
            <>
              <h1 className="reg-title">{name}</h1>
              {canEdit && (
                <div className="reg-toolbar">
                  <button className="btn" onClick={() => setEditingName(true)}>Edytuj nazwę</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", gap: 8, width: "100%", alignItems: "center", flexWrap: "wrap" }}>
              <input className="input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              <button className="btn btn-primary" onClick={handleSaveName} disabled={savingName}>
                {savingName ? "Zapisywanie…" : "Zapisz"}
              </button>
              <button className="btn" onClick={() => { setEditingName(false); setDraftName(name); }} disabled={savingName}>
                Anuluj
              </button>
              {err && <span className="error">{err}</span>}
            </div>
          )}
        </div>
      </div>

      {/* PODGLĄD + TEKST */}
      <RegulationContent
        text={data.text}
        updatedAt={data.updatedAt}
        pdfUrl={data.pdfUrl}
        pdfFileName={data.pdfFileName}
      />

      {/* EDYCJA (admin/judge) */}
      {canEdit && (
        <section className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Edycja regulaminu</h3>

            <div className="form-row">
              <label>Treść regulaminu:</label>
              <textarea
                className="textarea"
                rows={12}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Wgraj nowy PDF:</label>
              <input className="file" type="file" accept="application/pdf,.pdf" onChange={onPickFile} />
              {file && <div className="helper">Wybrano: {file.name}</div>}
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSaveReg} disabled={saving}>
                {saving ? "Zapisywanie…" : "Zapisz zmiany"}
              </button>
                {err && <span className="error">{err}</span>}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
