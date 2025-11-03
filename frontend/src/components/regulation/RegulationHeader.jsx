const RegulationHeader = ({ name, loading, err }) => {
  const title = `Regulamin${name ? ` — ${name}` : ""}`;
  if (loading) return <main><h1>{title}</h1><p>Ładowanie…</p></main>;
  if (err) return <main><h1>Regulamin</h1><p>{err}</p></main>;
  return <h1>{title}</h1>;
};

export default RegulationHeader;
