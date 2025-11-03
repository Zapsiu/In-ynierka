import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../AppStyles.css";
import { getProfile, updateProfile, changePasswordProfile } from "../api/auth";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileActions from "../components/profile/ProfileActions";
import TeamSummary from "../components/profile/TeamSummary";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", age: 0 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (!token || !username) {
      navigate("/logowanie");
      return;
    }
    getProfile(username)
      .then((res) => {
        const u = res.data;
        setUser(u);
        setForm({
          username: u.username || "",
          email: u.email || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          age: Number(u.age) || 0,
        });
      })
      .catch(() => navigate("/logowanie"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/logowanie");
    window.location.reload();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "age" ? Number(value) : value }));
  };

  const onSave = async () => {
    setErr(null); setMsg(null); setSaving(true);
    const current = localStorage.getItem("username");
    try {
      const payload = {
        newUsername: form.username !== user.username ? form.username : undefined,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age,
      };
      const { data } = await updateProfile(current, payload);
      setUser(data);
      setMsg("Zapisano zmiany profilu");

      if (payload.newUsername && payload.newUsername !== current) {
        localStorage.setItem("username", payload.newUsername);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    const username = localStorage.getItem("username");
    const currentPassword = prompt("Podaj obecne hasło:");
    if (!currentPassword) return;
    const newPassword = prompt("Podaj nowe hasło (min. 8 znaków):");
    if (!newPassword) return;
    try {
      await changePasswordProfile(username, currentPassword, newPassword); 
      setMsg("Hasło zmienione");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Błąd zmiany hasła");
    }
  };

  if (!user) return <div className="profile-container">Ładowanie profilu...</div>;

  return (
    <div className="profile-container" style={{ maxWidth: 640}}>
      
      <h2>Witaj, {user.firstName}!</h2>
      <div className="card" >
      {msg && <div className="notice success">{msg}</div>}
      {err && <div className="notice error">{err}</div>}
      <ProfileForm form={form} onChange={onChange} />
      <ProfileActions
        onSave={onSave}
        onChangePassword={onChangePassword}
        onLogout={handleLogout}
        saving={saving}
      />
      <TeamSummary team={user.team} />
    </div>
    </div>
  );
};

export default Profile;
