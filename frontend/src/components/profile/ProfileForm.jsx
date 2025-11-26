// src/components/profile/ProfileForm.jsx
export default function ProfileForm({ form, onChange }) {
  return (
    <div className="form-grid">
      <div className="field">
        <label className="label">Login (username)</label>
        <input
          className="input"
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="np. jan_kowalski"
          autoComplete="username"
        />
      </div>

      <div className="field">
        <label className="label">Email</label>
        <input
          className="input"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="field">
        <label className="label">Imię</label>
        <input
          className="input"
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          placeholder="Jan"
          autoComplete="given-name"
        />
      </div>

      <div className="field">
        <label className="label">Nazwisko</label>
        <input
          className="input"
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          placeholder="Kowalski"
          autoComplete="family-name"
        />
      </div>

      <div className="field">
        <label className="label">Wiek</label>
        <input
          className="input"
          name="age"
          type="number"
          min={10}
          max={120}
          value={form.age}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
