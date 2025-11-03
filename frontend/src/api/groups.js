import axios from "axios";
const BASE = "http://localhost:5000/api/groups";
const POF  = "http://localhost:5000/api/playoff";

export const fetchGroups = () => axios.get(`${BASE}/`);
export const generateGroups = (judgeUsername, { size = 4, robotIds } = {}) =>
  axios.post(`${BASE}/generate`, { size, robotIds }, { headers: { "x-username": judgeUsername } });
export const resetGroups = (judgeUsername) =>
  axios.post(`${BASE}/reset`, {}, { headers: { "x-username": judgeUsername } });

export const addScore = (judgeUsername, groupId, robotId, result /* 'win'|'draw'|'loss' */) =>
  axios.post(`${BASE}/${groupId}/score`, { robotId, result }, {
    headers: { "x-username": judgeUsername }
  });


export const fetchPlayoff = () => axios.get(`${POF}/`);
export const generatePlayoff = (judgeUsername, size = 8) =>
  axios.post(`${POF}/generate`, { size }, { headers: { "x-username": judgeUsername } });
