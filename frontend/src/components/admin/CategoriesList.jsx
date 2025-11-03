import React from "react";

const CategoriesList = ({ categories, onDelete }) => {
  return (
    <>
      <h3 style={{ marginTop: "2rem" }}>Kategorie</h3>
      <ul>
        {categories.map((cat) => (
          <li key={cat._id}>
            <strong>{cat.name}</strong>: {cat.description || "brak opisu"}
            <button onClick={() => onDelete(cat._id)} style={{ marginLeft: "10px", color: "red" }}>
              Usuń
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default CategoriesList;
