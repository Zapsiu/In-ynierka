import axios from "axios";
const API = "http://localhost:5000/api/team";

export const createTeam = (teamName, username) =>
  axios.post(`${API}/create`, { teamName, username });

export const leaveTeam = (username) =>
  axios.post(`${API}/leave`, { username });

export const getTeams = () => axios.get(`${API}`);

export const addMember = ({ teamId, requesterUsername, usernameToAdd }) =>
  axios.post(`${API}/add-member`, { teamId, requesterUsername, usernameToAdd });
export const getTeamByUsername = (username) =>
  axios.get(`${API}/by-user/${encodeURIComponent(username)}`);
