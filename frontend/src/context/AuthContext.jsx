import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // La sesión vive en una cookie httpOnly (invisible para JS), así que la única
    // forma de saber si hay una sesión activa al cargar la app es preguntarle al
    // backend directamente.
    async function loadUser() {
      try {
        const { data } = await axiosClient.get('/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(email, password) {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register({ nombre, telefono, email, password }) {
    const { data } = await axiosClient.post('/auth/register', {
      nombre,
      telefono,
      email,
      password,
    });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
