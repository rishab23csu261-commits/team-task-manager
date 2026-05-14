import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.PROD
    ? "team-task-manager-production-01a2.up.railway.app"
    : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;