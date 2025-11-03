export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const toFileUrl = (u) => (u && u.startsWith("/uploads") ? `${BACKEND_URL}${u}` : u || "");