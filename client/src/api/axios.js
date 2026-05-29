import axios from "axios";

// Always use relative /api in dev (Vite proxies to localhost:3001).
// In production (Vercel), use VITE_API_URL env var if set, otherwise fall back
// to the Railway URL. Set VITE_API_URL in your Vercel project settings.
let BASE_URL = import.meta.env.VITE_API_URL || "";

if (BASE_URL) {
  // Normalize protocols
  if (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
    BASE_URL = "https://" + BASE_URL;
  }
  // Remove trailing slash
  if (BASE_URL.endsWith("/")) {
    BASE_URL = BASE_URL.slice(0, -1);
  }
  // Ensure it has the /api suffix
  if (!BASE_URL.endsWith("/api")) {
    BASE_URL += "/api";
  }
} else {
  BASE_URL = import.meta.env.PROD
    ? "https://team-task-manager-production-01a2.up.railway.app/api"
    : "/api";
}

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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
