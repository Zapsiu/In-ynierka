import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const getUsers = () => API.get("/admin/users");
export const getTeams = () => API.get("/admin/teams");
export const getCategories = () => API.get("/categories");
export const getRobots = () => API.get("/admin/robots");
export const getGlobalTeamLimit = () => API.get("/admin/team-limit");

export const changeUserRole = (username, newRole) =>
  API.post("/admin/change-role", { username, newRole });

export const updateTeamLimit = (teamId, newLimit) =>
  API.post("/admin/update-team-limit", { teamId, newLimit: parseInt(newLimit) });

export const removeTeamMember = (teamId, username) =>
  API.post("/admin/remove-member", { teamId, username });

export const deleteRobot = (robotId) => API.delete(`/admin/delete-robot/${robotId}`);
export const deleteCategory = (categoryId) => API.delete(`/admin/delete-category/${categoryId}`);
export const deleteTeam = (teamId) => API.delete(`/admin/delete-team/${teamId}`);

export const saveGlobalTeamLimit = (limit) =>
  API.post("/admin/team-limit", { limit });

export const deleteUser = (username) => API.delete(`/admin/delete-user/${username}`);
