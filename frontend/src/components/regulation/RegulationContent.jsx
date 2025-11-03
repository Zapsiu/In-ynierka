import { toFileUrl } from "../../config";

export default function RegulationContent({ name, text, updatedAt, pdfUrl, pdfFileName }) {
  const fullPdf = toFileUrl(pdfUrl);
  return (
    <div style={{ display:"grid", gap:16 }}>
      <h2>{name}</h2>
      {fullPdf ? (
        <iframe title="Regulamin PDF" src={fullPdf} style={{ width:"100%", height:600, border:"1px solid var(--border,#24264a)", borderRadius:8 }} />
      ) : null}
      <article style={{ whiteSpace:"pre-wrap" }}>{text || "Brak treści regulaminu dla tej kategorii."}</article>
      {updatedAt && <p>Ostatnia aktualizacja: {new Date(updatedAt).toLocaleString()}</p>}
      {fullPdf ? <p>Oryginalny PDF: <a href={fullPdf} target="_blank" rel="noreferrer">{pdfFileName || "Pobierz"}</a></p> : null}
    </div>
  );
}