import { useEffect, useMemo, useState } from "react";
import { fetchCategories, uploadCategoryImage } from "../api/categories";
import EditorSection from "../components/regulation/EditorSection";
import CategoryGrid from "../components/regulation/CategoryGrid";

export default function Regulation() {
  const [cats, setCats] = useState([]);
  const [err, setErr] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    (async () => {
      try {
        const data = await fetchCategories();
        setCats(data);
        if (data[0]?._id) setSelectedId(data[0]._id);
      } catch (e) {
        setErr(e.message || "Błąd ładowania kategorii");
      }
    })();
  }, []);

  const canEdit = useMemo(() => ["admin", "judge"].includes(role), [role]);

  const handleImageUpload = async (id, file) => {
    const { imageUrl } = await uploadCategoryImage(id, file);
    setCats((prev) => prev.map((c) => (c._id === id ? { ...c, imageUrl } : c)));
  };

  if (err) return <main><h1>Regulaminy</h1><p>{err}</p></main>;
  if (!cats.length) return <main><h1>Regulaminy</h1><p>Ładowanie…</p></main>;

  return (
    <main>
      <h1>Regulaminy</h1>
      <CategoryGrid
        categories={cats}
        canEdit={canEdit}
        onSelect={setSelectedId}
        onUploadImage={handleImageUpload}
      />
    </main>
  );
}
