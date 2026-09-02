import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('kisansetu_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session restore error:', err);
        localStorage.removeItem('kisansetu_token');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('kisansetu_token', data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    if (data.success) {
      localStorage.setItem('kisansetu_token', data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('kisansetu_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, role: user?.role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
