import CategoryCard from "./CategoryCard";

export default function CategoryGrid({ categories, canEdit, onSelect, onUploadImage }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 16, marginTop: 16 }}>
      {categories.map((cat) => (
        <CategoryCard
          key={cat._id}
          cat={cat}
          canEdit={canEdit}
          onSelect={() => onSelect(cat._id)}
          onUploadImage={(file) => onUploadImage(cat._id, file)}
        />
      ))}
    </div>
  );
}