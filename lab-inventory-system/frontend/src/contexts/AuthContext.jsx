import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (username, password, role) => {
    try {
      const res = await axios.post('/api/login', { username, password, role });
      const { access_token, role: serverRole, user_id } = res.data;
      if (serverRole !== role) {
        return { success: false, message: 'Selected role does not match account role' };
      }
      setToken(access_token);
      const userData = { name: username, username, role: serverRole, id: user_id };
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return { success: true, role: serverRole };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};