import React, { useMemo } from "react";

function looksLikePdf(url) {
  return typeof url === "string" && /\.pdf(\?|#|$)/i.test(url);
}
function fmtDate(d) {
  try { return d ? new Date(d).toLocaleString() : ""; } catch { return String(d || ""); }
}

export default function RegulationContent({ pdfUrl, pdfFileName, text, updatedAt }) {
  const canEmbed = looksLikePdf(pdfUrl);

  return (
    <div className="reg-grid">
      {/* LEWA KOLUMNA – PDF */}
      <section className="card">
        <div className="card-body">
          {pdfUrl ? (
            <>
              <div className="pdf-head">
                <div className="pdf-filename">{pdfFileName || "Regulamin (PDF)"}</div>
                <div className="reg-toolbar">
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn">Otwórz w nowej karcie</a>
                  <a href={pdfUrl} download className="btn btn-primary">Pobierz PDF</a>
                </div>
              </div>

              {canEmbed ? (
                <div className="pdf-embed">
                  <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
                </div>
              ) : (
                <p className="helper" style={{ marginTop: 6 }}>
                  Ten adres nie wygląda na plik PDF – użyj przycisków powyżej, by otworzyć lub pobrać.
                </p>
              )}
            </>
          ) : (
            <p className="helper">Brak podpiętego pliku PDF.</p>
          )}
        </div>
      </section>

      {/* PRAWA KOLUMNA – TEKST + META */}
      <section className="card">
        <div className="card-body">
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Treść regulaminu</h2>
          <article className="textarea" style={{ whiteSpace: "pre-wrap", minHeight: 120 }}>
            {(text || "").trim() || "Brak treści regulaminu."}
          </article>

          <div className="meta">
            {updatedAt && <>Ostatnia aktualizacja: <strong>{fmtDate(updatedAt)}</strong></>}
            {pdfUrl && (
              <div style={{ marginTop: 4 }}>
                Oryginalny PDF: <a href={pdfUrl} target="_blank" rel="noreferrer">{pdfFileName || "pobierz"}</a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
