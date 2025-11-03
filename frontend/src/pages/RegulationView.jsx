import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRegulation } from "../api/regulations";
import { fetchCategories } from "../api/categories";
import RegulationContent from "../components/regulation/RegulationContent";

export default function RegulationView() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [data, setData] = useState({ text: "", pdfUrl: "", pdfFileName: "", updatedAt: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const cats = await fetchCategories();
        const c = cats.find((x) => x._id === id);
        if (live) setName(c?.name || "Regulamin");
      } catch {}
      try {
        const r = await getRegulation(id);
        if (live) setData(r);
      } catch (e) {
        if (live) setErr(e.message || "Błąd");
      }
    })();
    return () => { live = false; };
  }, [id]);

  if (err) return <main><h1>{name}</h1><p>{err}</p></main>;

  return (
    <main>
      <h1>{name}</h1>
      <RegulationContent
        text={data.text}
        updatedAt={data.updatedAt}
        pdfUrl={data.pdfUrl}
        pdfFileName={data.pdfFileName}
      />
    </main>
  );
}