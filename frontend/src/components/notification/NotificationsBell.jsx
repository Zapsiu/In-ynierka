import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,   
} from "../../api/notifications";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const data = await fetchNotifications();
      setList(data.notifications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <div className="notif-wrapper">
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="notif-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-popup">
          <div className="notif-header">
            <span className="notif-title">Powiadomienia</span>
            {list.length > 0 && (
              <button
                className="notif-mark-all"
                onClick={async () => {
                  await markAllNotificationsRead();
                  load();
                }}
              >
                Oznacz wszystkie jako przeczytane
              </button>
            )}
          </div>

          {list.length === 0 && (
            <p className="notif-empty">Brak powiadomień</p>
          )}

          {list.map((n) => (
  <div
    key={n._id}
    className={
      "notif-item" + (n.read ? "" : " notif-item-unread")
    }
  >
    <div
      className="notif-item-content"
      onClick={async () => {
        if (!n.read) {
          await markNotificationRead(n._id);
          load();
        }
      }}
    >
      <div className="notif-message">{n.message}</div>
      <div className="notif-date">
        {new Date(n.createdAt).toLocaleString()}
      </div>
    </div>

    <button
      className="notif-delete-btn"
      onClick={async () => {
        await deleteNotification(n._id);
        load();
      }}
    >
      🗑
    </button>
  </div>
))}

        </div>
      )}
    </div>
  );
}
