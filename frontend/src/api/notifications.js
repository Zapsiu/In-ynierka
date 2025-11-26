const envUrl =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  "";

const BASE = "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "";
  return {
    "Content-Type": "application/json",
    "x-username": username,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchNotifications() {
  const r = await fetch(`${BASE}/api/notifications`, {
    headers: authHeaders()
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); 
}

export async function markNotificationRead(id) {
  const r = await fetch(`${BASE}/api/notifications/${id}/read`, {
    method: "POST",
    headers: authHeaders()
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function markAllNotificationsRead() {
  const r = await fetch(`${BASE}/api/notifications/read-all`, {
    method: "POST",
    headers: authHeaders()
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
export async function deleteNotification(id) {
  const r = await fetch(`${BASE}/api/notifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteAllNotifications() {
  const r = await fetch(`${BASE}/api/notifications`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
