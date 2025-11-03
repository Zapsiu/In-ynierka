import { useEffect, useState } from "react";
import { getRegulation, saveRegulation } from "../../api/regulations";
import { toFileUrl } from "../../config";

export default function RegulationEditor({ categoryId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const data = await getRegulation(categoryId);
      if (!live) return;
      setText(data.text || "");
      setPdfUrl(data.pdfUrl || "");
      setPdfFileName(data.pdfFileName || "");
      setFile(null);
      setMsg("");
    })();
    return () => { live = false; };
  }, [categoryId]);

  const onSave = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await saveRegulation(categoryId, { text, file });
      setPdfUrl(res.pdfUrl || pdfUrl);
      setPdfFileName(res.pdfFileName || pdfFileName);
      setMsg("Zapisano");
      setFile(null);
    } catch (e) {
      setMsg(e?.message || "Błąd zapisu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border,#24264a)", background: "var(--elev,#141424)", color: "var(--text,#eef1f3)", fontFamily: "inherit" }}
        placeholder="Treść regulaminu"
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ border: "1px solid var(--border,#24264a)", background: "transparent", color: "var(--text,#eef1f3)", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} hidden />
          {file ? file.name : "Wgraj PDF"}
        </label>
        <button onClick={onSave} disabled={busy} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#24264a)", background: "var(--panel,#181832)", color: "var(--text,#eef1f3)", cursor: "pointer" }}>
          {busy ? "Zapisywanie…" : "Zapisz"}
        </button>
        {msg && <small style={{ color: "#a7acc0" }}>{msg}</small>}
      </div>
      {pdfUrl && (
        <p>
          Oryginalny PDF: <a href={toFileUrl(pdfUrl)} target="_blank" rel="noreferrer">{pdfFileName || "Pobierz"}
          </a>
        </p>
      )}
    </div>
  );
}