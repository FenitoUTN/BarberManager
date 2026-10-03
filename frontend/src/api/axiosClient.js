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

// Cuando el backend responde 401 a una llamada ya iniciada, la sesión caducó o el
// usuario fue desactivado. Sin esto, cada pantalla seguía mirando datos viejos y el
// usuario no se enteraba hasta que clickeaba algo. Se avisa por evento para que sea
// AuthContext quien resuelva el estado de sesión y no este módulo.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Se excluyen las propias rutas de autenticación: /auth/me devuelve 401 cuando no
    // hay sesión y eso ya lo maneja AuthContext al cargar la app.
    if (status === 401 && !url.includes('/auth/')) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
