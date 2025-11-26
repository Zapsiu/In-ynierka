import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toFileUrl } from "../../config"; 

export default function CategoryCard({ cat, canEdit, onSelect, onUploadImage }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const pick = () => inputRef.current?.click();
  const change = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await onUploadImage(file);
    } catch (er) {
      setError(er?.message || "Błąd");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: "var(--panel,#181832)", border: "1px solid var(--border,#24264a)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow,0 2px 10px rgba(0,0,0,.25))" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
        {cat.imageUrl ? (
          <img src={toFileUrl(cat.imageUrl)} alt={cat.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:8 }} />
        ) : (
          <div style={{ width: "100%", height: "100%", borderRadius: 8, background: "#101020", display: "grid", placeItems: "center", color: "#a7acc0", fontSize: 14 }}>Brak obrazka</div>
        )}
        {canEdit && (
          <>
            <input ref={inputRef} type="file" accept="image/*" onChange={change} style={{ display: "none" }} />
            <button onClick={pick} disabled={busy} style={{ position: "absolute", right: 12, bottom: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#24264a)", background: "var(--elev,#141424)", color: "var(--text,#eef1f3)", cursor: "pointer" }}>
              {busy ? "Wgrywanie…" : "Wgraj obrazek"}
            </button>
          </>
        )}
      </div>
      <h3 style={{ margin: 0, fontSize: 16 }}>
        <Link to={`/regulamin/${cat._id}`}>{cat.name}</Link>
      </h3>
      {canEdit }
      {error && <small style={{ color: "#ef4444" }}>{error}</small>}
    </div>
  );
}