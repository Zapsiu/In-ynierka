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

export async function fetchGroups(categoryId) {
  const url = new URL(`${BASE}/api/groups`);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  const r = await fetch(url, { headers: authHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); 
}

export async function generateGroups(size, categoryId) {
  const body = { size, categoryId };
  const r = await fetch(`${BASE}/api/groups/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function resetGroups(categoryId) {
  const r = await fetch(`${BASE}/api/groups/reset`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ categoryId })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function addScore(groupId, robotId, result, delta = "inc") {
  const r = await fetch(`${BASE}/api/groups/${groupId}/score`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ robotId, result, delta })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
