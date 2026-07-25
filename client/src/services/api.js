import axios from 'axios';
import { getToken, clearAuth } from '../utils/storage';

/**
 * Pre-configured Axios instance for the WolloShare backend.
 *
 * baseURL   – points to the Express API (fallback to localhost:5000/api).
 * interceptors – attach the stored JWT on every outgoing request
 *                and clear auth data when the server returns 401.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT if available ──────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 (expired / invalid token) ─
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  },
);

export default api;

