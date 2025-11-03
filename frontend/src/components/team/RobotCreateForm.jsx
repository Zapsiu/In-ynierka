const RobotCreateForm = ({
  onSubmit, robotName, setRobotName,
  categories, selectedCategory, setSelectedCategory
}) => (
  <form onSubmit={onSubmit} className="form">
    <label>
      Nazwa robota:
      <input value={robotName} onChange={(e) => setRobotName(e.target.value)} required />
    </label>
    <label>
      Kategoria:
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
        <option value="" disabled>Wybierz kategorię</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>
    </label>
    <button type="submit">Dodaj robota</button>
  </form>
);

export default RobotCreateForm;
