const ProfileActions = ({ onSave, onChangePassword, onLogout, saving }) => {
  return (
    <div className="actions" style={{gap:8,marginTop:10}}>
      <button onClick={onSave} disabled={saving} className="primary">Zapisz</button>
      <button onClick={onChangePassword}>Zmień hasło</button>
      <button onClick={onLogout} className="logout-button">Wyloguj</button>
    </div>
  );
};

export default ProfileActions;
