import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000/api/robot" });

export const getRobotsByUsername = (username) =>
  API.get(`/team/${encodeURIComponent(username)}`);

export const createRobot = ({ username, robotName, categoryId }) =>
  API.post("/create", { username, robotName, categoryId });
