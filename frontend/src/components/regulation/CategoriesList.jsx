import { Link } from "react-router-dom";

const CategoriesList = ({ categories, canEdit, onSelect }) => {
  return (
    <ul>
      {categories.map((cat) => (
        <li key={cat._id}>
          <strong>{cat.name}</strong>
          {" — "}
          <Link to={`/regulamin/${cat._id}`}>Podgląd</Link>
          {canEdit && (
            <>
              {" | "}
              <button type="button" onClick={() => onSelect(cat._id)}>
                Edytuj
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoriesList;
