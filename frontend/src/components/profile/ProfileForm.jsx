const ProfileForm = ({ form, onChange }) => {
  return (
    <div className="grid" style={{gap:15,marginTop:10}}>
      <label>
        <span>Login (username)</span>
        <input name="username" value={form.username} onChange={onChange} />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" value={form.email} onChange={onChange} />
      </label>
      <label>
        <span>Imię</span>
        <input name="firstName" value={form.firstName} onChange={onChange} />
      </label>
      <label>
        <span>Nazwisko</span>
        <input name="lastName" value={form.lastName} onChange={onChange} />
      </label>
      <label>
        <span>Wiek</span>
        <input name="age" type="number" min={0} value={form.age} onChange={onChange} />
      </label>
    </div>
  );
};

export default ProfileForm;
