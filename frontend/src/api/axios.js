import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '/api';

const getNormalizedBaseURL = (url) => {
  const trimmed = (url || '/api').trim().replace(/\/+$/, '');
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.endsWith('/api')
  ) {
    return `${trimmed}/api`;
  }
  return trimmed;
};

const api = axios.create({
  baseURL: getNormalizedBaseURL(rawBaseURL),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const skipAuth = config.headers?.['x-skip-auth'];
  if (skipAuth) {
    delete config.headers['x-skip-auth'];
    return config;
  }
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipLogout = error.config?.headers?.['x-skip-logout'];
    if (error.response?.status === 401 && !skipLogout) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
