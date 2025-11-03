import axios from "axios";

const API_URL = "http://localhost:5000/api/regulations";

export const getRegulation = async (categoryId) => {
  try {
    const { data } = await axios.get(`${API_URL}/${categoryId}`);
    return data;
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return { text: "", pdfUrl: "", pdfFileName: "" };
    }
    throw e;
  }
};

export const saveRegulation = async (categoryId, { text, file }) => {
  const fd = new FormData();
  fd.append("text", text || "");
  if (file) fd.append("pdf", file);

  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "multipart/form-data" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const { data } = await axios.post(`${API_URL}/${categoryId}`, fd, { headers });
  return data;
};
