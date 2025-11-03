import { useEffect, useMemo, useState } from "react";
import { saveRegulation, getRegulation } from "../api/regulations";


export default function RegulationEditor({
  categories = [],
  allowedRoles = ["admin","judge"],
  initialCategoryId,
}) {
  const [role, setRole] = useState(null);
  const [categoryId, setCategoryId] = useState(initialCategoryId || categories[0]?._id || "");
  const [text, setText] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setRole(localStorage.getItem("role")); }, []);
  useEffect(() => { if (initialCategoryId) setCategoryId(initialCategoryId); }, [initialCategoryId]);
  useEffect(() => { if (!categoryId && categories[0]?._id) setCategoryId(categories[0]._id); }, [categories, categoryId]);

  useEffect(() => {
    (async () => {
      if (!categoryId) return;
      try {
        setErr("");
        const data = await getRegulation(categoryId);
        setText(data.text || "");
        setPdfUrl(data.pdfUrl || "");
        setPdfName(data.pdfFileName || "");
        setFile(null);
      } catch (e) { setErr(e.message); }
    })();
  }, [categoryId]);

  const canEdit = useMemo(() => allowedRoles.includes(role), [allowedRoles, role]);


const pdfToText = async (ab) => {
  const mod = await import("pdfjs-dist/build/pdf");
  const pdfjs = mod.default || mod;

  // wyłącz worker całkowicie
  pdfjs.GlobalWorkerOptions.workerSrc = ""; // upewnia, że nie próbuje ładować
  pdfjs.disableWorker = true;

  const pdf = await pdfjs.getDocument({ data: ab, disableWorker: true }).promise;

  const parts = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    parts.push(content.items.map(i => i.str ?? "").join(" ").trim());
  }
  return parts.join("\n\n").trim();
};


  const docxToText = async (ab) => {
    const mod = await import("mammoth/mammoth.browser");
    const mammoth = mod.default || mod;
    const { value } = await mammoth.extractRawText({ arrayBuffer: ab });
    return (value || "").trim();
  };

  const handleUpload = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErr("");
    try {
      if (f.size > 20 * 1024 * 1024) throw new Error("Plik > 20MB");
      const ab = await f.arrayBuffer();
      const lower = f.name.toLowerCase();

      if (lower.endsWith(".pdf")) {
        setText(await pdfToText(ab));
        setFile(f); 
      } else if (lower.endsWith(".docx")) {
        setText(await docxToText(ab));
        setFile(null); 
      } else {
        throw new Error("Obsługuję PDF lub DOCX");
      }
    } catch (e2) { setErr(e2.message); }
  };

  const handleSave = async () => {
    if (!categoryId) return;
    setBusy(true); setErr("");
    try {
      const saved = await saveRegulation(categoryId, { text, file });
      setPdfUrl(saved.pdfUrl || "");
      setPdfName(saved.pdfFileName || "");
      setFile(null);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (!canEdit) return <p>Brak uprawnień (tylko admin/judge).</p>;

  return (
    <div>
      <div>
        <label>Kategoria: </label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <input
          type="file"
          accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleUpload}
        />
      </div>

      {pdfUrl && <p>Aktualny PDF: <a href={pdfUrl} target="_blank" rel="noreferrer">{pdfName || "pobierz"}</a></p>}
      {err && <p>{err}</p>}

      <div>
        <label>Treść regulaminu:</label>
        <textarea rows={18} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div>
        <button onClick={handleSave} disabled={busy}>{busy ? "Zapisywanie..." : "Zapisz"}</button>
        {categoryId && <a href={`/regulamin/${categoryId}`} style={{ marginLeft: 8 }}>Podgląd</a>}
      </div>
    </div>
  );
}
