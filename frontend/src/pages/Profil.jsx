import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

  const role = useMemo(() => localStorage.getItem("role") || "user", []);
  const initials = useMemo(() => {
    const f = (form.firstName || "").trim()[0] || "";
    const l = (form.lastName || "").trim()[0] || "";
    return (f + l || (form.username[0] || "")).toUpperCase();
  }, [form]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (!token || !username) { navigate("/logowanie"); return; }

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
    if (!confirm("Na pewno wylogować?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/logowanie");
    window.location.reload();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "age" ? Number(value) : value }));
  };

  const validate = () => {
    if (!form.username.trim()) return "Login nie może być pusty";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Podaj poprawny adres e-mail";
    if (form.age && (form.age < 10 || form.age > 120)) return "Wiek poza zakresem (10–120)";
    return null;
    };

  const onSave = async () => {
    setErr(null); setMsg(null);
    const v = validate();
    if (v) { setErr(v); return; }

    setSaving(true);
    const current = localStorage.getItem("username");
    try {
      const payload = {
        newUsername: form.username !== user.username ? form.username : undefined,
        email: form.email, firstName: form.firstName, lastName: form.lastName, age: form.age,
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
    <div className="profile-wrap">
      <div className="profile-head">
        <div className="profile-id">
          <div className="avatar">{initials || "?"}</div>
          <div>
            <h2 style={{ margin: 0 }}>Witaj, {user.firstName || user.username}!</h2>
            <div className="badge">Rola: {role}</div>
          </div>
        </div>
      </div>

      {msg && <div className="notice success">{msg}</div>}
      {err && <div className="notice error">{err}</div>}

      <div className="card">
        <div className="card-body">
          <ProfileForm form={form} onChange={onChange} />
          <div className="actions" style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? "Zapisywanie…" : "Zapisz"}
            </button>
            <button className="btn" onClick={onChangePassword}>Zmień hasło</button>
            <button className="btn btn-danger" onClick={handleLogout}>Wyloguj</button>
          </div>

          <div className="team-box">
            <TeamSummary team={user.team} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
