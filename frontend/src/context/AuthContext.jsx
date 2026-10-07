import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('daycraft_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('daycraft_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const profileData = await api.getProfile();
          setUser(profileData.user);
          localStorage.setItem('daycraft_user', JSON.stringify(profileData.user));
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('daycraft_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('daycraft_unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('daycraft_token', data.token);
    localStorage.setItem('daycraft_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, dailyTaskTarget = 3) => {
    const data = await api.register({
      name,
      email,
      password,
      daily_task_target: dailyTaskTarget,
    });
    localStorage.setItem('daycraft_token', data.token);
    localStorage.setItem('daycraft_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('daycraft_token');
    localStorage.removeItem('daycraft_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('daycraft_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
