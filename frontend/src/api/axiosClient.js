import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const SAFE_METHODS = new Set(['get', 'head', 'options']);

axiosClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = readCookie('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

export default axiosClient;
