// src/api/playoff.js
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

export async function fetchPlayoff(categoryId) {
  const url = new URL(`${BASE}/api/playoff`);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  const r = await fetch(url, { headers: authHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { playoff: {...} | null }
}

export async function generatePlayoff(size, categoryId) {
  const body = { size, categoryId };
  const r = await fetch(`${BASE}/api/playoff/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { message, playoff }
}

export async function updatePlayoffMatch(playoffId, payload) {
  const r = await fetch(`${BASE}/api/playoff/${playoffId}/match`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload) // { round, index, winner }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { message, playoff }
}
