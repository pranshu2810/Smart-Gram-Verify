import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle auth errors safely without breaking login attempts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginReq = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/me');
    const isPublicPage = window.location.pathname.startsWith('/client') || window.location.pathname.startsWith('/citizen');
    const isLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isLoginReq && !isPublicPage && !isLoginPage) {
      localStorage.removeItem('sg_token');
      localStorage.removeItem('sg_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
