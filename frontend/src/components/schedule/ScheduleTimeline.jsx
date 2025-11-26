import "../../AppStyles.css";

export default function ScheduleTimeline({ events, onEdit, onDelete }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  const canEdit = typeof onEdit === "function";
  const canDelete = typeof onDelete === "function";

  return (
    <div className="timeline-container">
      {sorted.length === 0 && (
        <p className="timeline-empty">Brak wydarzeń w harmonogramie.</p>
      )}

      {sorted.map((ev, index) => {
        const start = new Date(ev.startTime);
        const end = new Date(ev.endTime);

        const timeRange = `${start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })} – ${end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}`;

        const fullDate = start.toLocaleDateString();

        return (
          <div key={ev._id || index} className="timeline-row">
            <div className="timeline-main">
              <div className="timeline-title-line">
                <span className="timeline-title">{ev.title}</span>
                <span className="timeline-time-range">{timeRange}</span>
              </div>

              <div className="timeline-meta">
                {ev.location && (
                  <span className="timeline-meta-item">
                    Miejsce: <strong>{ev.location}</strong>
                  </span>
                )}
                {ev.category && ev.category.name && (
                  <span className="timeline-meta-item">
                    Kategoria: <strong>{ev.category.name}</strong>
                  </span>
                )}
              </div>

              <div className="timeline-date">{fullDate}</div>
            </div>

            {(canEdit || canDelete) && (
              <div className="timeline-actions">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(ev)}
                    className="btn-secondary timeline-action-btn"
                  >
                    Edytuj
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(ev._id)}
                    className="timeline-delete-btn"
                  >
                    Usuń
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
