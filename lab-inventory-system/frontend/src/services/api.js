import axios from 'axios';

const RENDER_API_BASE_URL = 'https://lab-inventory-backend-5393.onrender.com';
const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// Use env variable when provided; otherwise always default to Render backend.
const API_BASE_URL = (envBaseUrl || RENDER_API_BASE_URL).replace(/\/+$/, '');

// Create axios instance with configured base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;