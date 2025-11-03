import RegulationEditor from "./RegulationEditor";

export default function EditorSection({ categories, selectedId }) {
  const current = categories.find((c) => c._id === selectedId);
  if (!current) return null;
  return (
    <>
      <h2>Edytujesz: {current.name}</h2>
      <RegulationEditor categoryId={selectedId} />
    </>
  );
}
