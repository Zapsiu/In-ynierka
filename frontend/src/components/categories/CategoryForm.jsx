import { useState } from "react";

const CategoryForm = ({ onCreate }) => {
  const [form, setForm] = useState({ name: "", description: "" });

  const submit = async (e) => {
    e.preventDefault();
    await onCreate(form);
    setForm({ name: "", description: "" });
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Nazwa kategorii:
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>
      <label>
        Opis:
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <button type="submit">Dodaj kategorię</button>
    </form>
  );
};

export default CategoryForm;
