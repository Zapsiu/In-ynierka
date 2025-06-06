import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const registerUser = (username, password, firstName, lastName, age) =>
  axios.post(`${API_URL}/register`, {
    username,
    password,
    firstName,
    lastName,
    age
  });

export const loginUser = (username, password) =>
  axios.post(`${API_URL}/login`, { username, password });

export const getProfile = (username) =>
  axios.get(`${API_URL}/profil`, {
    headers: {
      "x-username": username,
    },
  });
