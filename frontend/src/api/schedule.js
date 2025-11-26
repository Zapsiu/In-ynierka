const envUrl =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  "";

const BASE =
  envUrl || `${window.location.protocol}//${window.location.hostname}:5000`;

function authHeaders() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "";
  return {
    "Content-Type": "application/json",
    "x-username": username,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchSchedule(categoryId) {
  const url = new URL(`${BASE}/api/schedule`);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  const r = await fetch(url, { headers: authHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); 
}

export async function createScheduleEntry(payload) {
  const r = await fetch(`${BASE}/api/schedule`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateScheduleEntry(id, payload) {
  const r = await fetch(`${BASE}/api/schedule/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteScheduleEntry(id) {
  const r = await fetch(`${BASE}/api/schedule/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
