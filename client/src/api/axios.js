import axios from "axios";

// Always use relative /api in dev (Vite proxies to localhost:3001).
// In production (Vercel), use VITE_API_URL env var if set, otherwise fall back
// to the Railway URL. Set VITE_API_URL in your Vercel project settings.
const BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? "https://team-task-manager-production-01a2.up.railway.app/api"
    : "/api");

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Attach JWT on every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401/403 — only redirect if NOT already on a public page
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthError = status === 401 || status === 403;
    const isPublicPage =
      window.location.pathname === '/login' ||
      window.location.pathname === '/signup';

    if (isAuthError && !isPublicPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
