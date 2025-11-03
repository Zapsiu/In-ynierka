const CategoriesList = ({ categories }) => {
  return (
    <>
      <h3>Istniejące kategorie</h3>
      <ul>
        {categories.map((cat) => (
          <li key={cat._id}>
            <strong>{cat.name}</strong> – {cat.description || "brak opisu"}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CategoriesList;
