export default function SeedsCard({ seeds }) {
  if (!seeds || seeds.length === 0) return null;

  return (
    <div className="card" style={{ padding: 12, marginBottom: 16 }}> 
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Rozstawienie</h3>
      <div style={{ display: "grid", rowGap: 10 }}> 
        {seeds.map((s, idx) => {
          const robot = s.robot || {};
          const name = robot.name || "(nieznany robot)";
          return (
            <div key={robot._id || idx} style={{ padding: "6px 8px" }}>
              {idx + 1}. {name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
