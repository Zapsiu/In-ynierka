import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchCategories, createCategory } from "../api/categories";
import CategoryForm from "../components/categories/CategoryForm";
import CategoriesList from "../components/categories/CategoriesList";

const JudgePanel = () => {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const list = await fetchCategories();
    setCategories(Array.isArray(list) ? list : []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    setMessage("");
    const res = await createCategory(payload);
    setMessage(res?.message || "Dodano kategorię");
    await load();
  };

  return (
    <div className="profile-container">
      <h2>Panel Sędziego</h2>
      <div className="card" style={{gap:15}}>

      {message && <p style={{ color: "green" }}>{message}</p>}
      <CategoryForm onCreate={handleCreate} />
      <CategoriesList categories={categories} />
      </div>
    </div>
  );
};

export default JudgePanel;
