import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://team-task-manager-production-01a2.up.railway.app/api"
    : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;