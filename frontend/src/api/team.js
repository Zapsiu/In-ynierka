import axios from "axios";

const API = "http://localhost:5000/api/teams";

export const createTeam = (name, limit, username) =>
  axios.post(API, {
    name,
    limit,
    username
  });


export const joinTeam = (teamId, username) =>
  axios.put(`${API}/${teamId}/join`, { username });

export const getTeams = () =>
  axios.get(API);
