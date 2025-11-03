// Fallback działa i w Vite i w CRA
const envUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  '';

const BASE = envUrl || `${window.location.protocol}//${window.location.hostname}:5000`;

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const ChatAPI = {
  createOrGetConversation: async (staffUsernames = []) => {
    const r = await fetch(`${BASE}/api/chat/conversation`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ staffUsernames })
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  listMyConversations: async () => {
    const r = await fetch(`${BASE}/api/chat/conversations`, { headers: authHeaders() });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  addStaff: async (conversationId, username) => {
    const r = await fetch(`${BASE}/api/chat/conversation/${conversationId}/add-staff`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ username })
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  listMessages: async (conversationId) => {
    const r = await fetch(`${BASE}/api/chat/conversation/${conversationId}/messages`, { headers: authHeaders() });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  sendMessage: async (conversationId, body) => {
    const r = await fetch(`${BASE}/api/chat/conversation/${conversationId}/messages`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ body })
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  markRead: async (conversationId) => {
    const r = await fetch(`${BASE}/api/chat/conversation/${conversationId}/read`, {
      method: 'POST', headers: authHeaders()
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
};
