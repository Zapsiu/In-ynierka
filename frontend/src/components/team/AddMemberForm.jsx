const AddMemberForm = ({ visible, memberNick, setMemberNick, onSubmit }) => {
  if (!visible) return null;
  return (
    <form onSubmit={onSubmit} className="form">
      <label>
        Dodaj członka (username):
        <input value={memberNick} onChange={(e) => setMemberNick(e.target.value)} required />
      </label>
      <button type="submit">Dodaj do drużyny</button>
    </form>
  );
};

export default AddMemberForm;
