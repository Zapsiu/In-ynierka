const TeamCreateForm = ({ teamName, setTeamName, globalLimit, onSubmit }) => (
  <form onSubmit={onSubmit} className="form">
    <label>
      Nazwa drużyny:
      <input value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
    </label>
    {globalLimit !== null && (
      <p style={{ fontSize: "0.9rem", margin: "5px 0", color: "#aaa" }}>
        Limit członków dla nowej drużyny: <strong>{globalLimit}</strong>
      </p>
    )}
    <button type="submit">Utwórz drużynę</button>
  </form>
);

export default TeamCreateForm;
