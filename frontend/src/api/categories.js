import axios from "axios";

const API_URL = "http://localhost:5000/api/categories";

export const fetchCategories = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await axios.post(`${API_URL}/create`, payload);
  return data;
};

export const uploadCategoryImage = async (categoryId, file) => {
  const fd = new FormData();
  fd.append("image", file);

  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "multipart/form-data" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const { data } = await axios.post(`${API_URL}/${categoryId}/image`, fd, { headers });
  return data;
};