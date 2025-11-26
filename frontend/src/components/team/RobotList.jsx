const RobotsList = ({ robots = [] }) => {
  if (!robots.length) {
    return (
      <>
        <h3>Twoje roboty:</h3>
        <p className="helper">Brak dodanych robotów.</p>
      </>
    );
  }

  const grouped = robots.reduce((acc, r) => {
    const categoryName =
      r.category?.name || r.category?.title || "Bez kategorii";

    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(r);
    return acc;
  }, {});

  return (
    <>
      <h3>Twoje roboty:</h3>
      {Object.entries(grouped).map(([categoryName, list]) => (
        <div key={categoryName} className="robots-category-block">
          <h4 className="robots-category-title">{categoryName}</h4>
          <ul>
            {list.map((r) => (
              <li key={r._id}>{r.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};

export default RobotsList;
