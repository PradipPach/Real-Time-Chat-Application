import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_URL = API_URL.replace(/^http/, "ws"); // http -> ws, https -> wss

const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expired, clear it and go to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.includes("/auth/login") || err.config?.url?.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthCall && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Turn any error into a readable message
export function getErrorMessage(err) {
  if (err.response?.data?.detail) return err.response.data.detail;
  if (err.code === "ERR_NETWORK") return "Cannot reach the server. Is the backend running?";
  return "Something went wrong. Please try again.";
}

export default api;
