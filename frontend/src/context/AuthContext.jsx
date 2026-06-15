import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosClient.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  function persistSession(data) {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email, password) {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    persistSession(data);
    return data.user;
  }

  async function register({ nombre, telefono, email, password }) {
    const { data } = await axiosClient.post('/auth/register', {
      nombre,
      telefono,
      email,
      password,
    });
    persistSession(data);
    return data.user;
  }

  async function logout() {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }

  const value = { user, token, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
