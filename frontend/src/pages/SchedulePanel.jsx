// src/pages/SchedulePanel.jsx
import { useEffect, useState } from "react";
import "../AppStyles.css";
import { fetchCategories } from "../api/categories";
import {
  fetchSchedule,
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry
} from "../api/schedule";
import ScheduleTimeline from "../components/schedule/ScheduleTimeline";

export default function SchedulePanel() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [role, setRole] = useState("");

  useEffect(() => {
    const r = localStorage.getItem("role") || "";
    setRole(r);
  }, []);

  const canManage = role === "admin" || role === "judge";

  useEffect(() => {
    (async () => {
      try {
        const cats = await fetchCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function loadSchedule(catId) {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchSchedule(catId || "");
      setSchedule(data.schedule || []);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule(selectedCategoryId);
  }, [selectedCategoryId]);

  function resetForm() {
    setTitle("");
    setLocation("");
    setStart("");
    setEnd("");
    setEditingId(null);
  }

  async function handleAddOrUpdate(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!title || !start || !end) {
      setErr("Tytuł, start i koniec są wymagane");
      return;
    }

    const payload = {
      title,
      categoryId: selectedCategoryId || null,
      location,
      startTime: start,
      endTime: end
    };

    try {
      if (editingId) {
        await updateScheduleEntry(editingId, payload);
        setMsg("Zaktualizowano wydarzenie w harmonogramie");
      } else {
        await createScheduleEntry(payload);
        setMsg("Dodano wydarzenie do harmonogramu");
      }

      resetForm();
      await loadSchedule(selectedCategoryId);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Usunąć to wydarzenie?")) return;
    try {
      await deleteScheduleEntry(id);
      await loadSchedule(selectedCategoryId);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  function handleEditStart(ev) {
    setEditingId(ev._id);
    setTitle(ev.title || "");
    setLocation(ev.location || "");

    if (ev.category && ev.category._id) {
      setSelectedCategoryId(ev.category._id);
    } else {
      setSelectedCategoryId("");
    }

    if (ev.startTime) {
      const d = new Date(ev.startTime);
      setStart(d.toISOString().slice(0, 16));
    }

    if (ev.endTime) {
      const d2 = new Date(ev.endTime);
      setEnd(d2.toISOString().slice(0, 16));
    }
  }

  return (
    <div className="profile-container">
      <h2>Harmonogram zawodów</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        {/* Górny pasek z kategorią – podobnie jak w Play-off */}
        <div className="schedule-top">
          <span className="schedule-top-label">Kategoria:</span>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Wszystkie</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {canManage && (
          <form onSubmit={handleAddOrUpdate} className="schedule-form">
            <div className="schedule-field">
              <label>Tytuł</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="schedule-field">
              <label>Miejsce</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="schedule-field">
              <label>Start</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div className="schedule-field">
              <label>Koniec</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>

            <div className="schedule-buttons">
              <button type="submit" className="btn-primary">
                {editingId ? "Zapisz zmiany" : "Dodaj do harmonogramu"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Anuluj edycję
                </button>
              )}
            </div>
          </form>
        )}

        {msg && <p style={{ color: "lightgreen", marginTop: 8 }}>{msg}</p>}
        {err && <p style={{ color: "salmon", marginTop: 8 }}>{err}</p>}
      </div>

      <div className="card">
        <h3>Wydarzenia</h3>
        {loading && <p>Ładowanie...</p>}
        {!loading && (
          <ScheduleTimeline
            events={schedule}
            onEdit={canManage ? handleEditStart : undefined}
            onDelete={canManage ? handleDelete : undefined}
          />
        )}
      </div>
    </div>
  );
}
