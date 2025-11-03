import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const registerUser = (username, password, firstName, lastName, age, email) =>
  axios.post(`${API_URL}/register`, { username, password, firstName, lastName, age, email });

export const loginUser = (username, password) =>
  axios.post(`${API_URL}/login`, { username, password });

export const getProfile = (username) =>
  axios.get(`${API_URL}/profil`, {
    headers: { "x-username": username },
  });

export const updateProfile = (username, { newUsername, email, firstName, lastName, age }) =>
  axios.patch(`${API_URL}/profil`, { newUsername, email, firstName, lastName, age }, {
    headers: { "x-username": username },
  });

export const changePasswordProfile = (username, currentPassword, newPassword) =>
  axios.post(`${API_URL}/profil/change-password`, { currentPassword, newPassword }, {
    headers: { "x-username": username },
  });
