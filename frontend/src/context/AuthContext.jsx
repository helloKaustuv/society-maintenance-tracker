import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smt_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smt_token');
      const savedUser = localStorage.getItem('smt_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Refresh user data from server in background
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('smt_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid:', err.message);
          localStorage.removeItem('smt_token');
          localStorage.removeItem('smt_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { user: userData, token: jwtToken } = response.data;

    localStorage.setItem('smt_token', jwtToken);
    localStorage.setItem('smt_user', JSON.stringify(userData));

    setUser(userData);
    setToken(jwtToken);
    return userData;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { user: newUser, token: jwtToken } = response.data;

    localStorage.setItem('smt_token', jwtToken);
    localStorage.setItem('smt_user', JSON.stringify(newUser));

    setUser(newUser);
    setToken(jwtToken);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('smt_token');
    localStorage.removeItem('smt_user');
    setUser(null);
    setToken(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('smt_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isResident: user?.role === 'resident',
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
