import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('cabgo_role') || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Re-fetch profile on initial boot if token exists
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('cabgo_role');

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      if (savedRole === 'captain') {
        const res = await authApi.getCaptainProfile();
        setCaptain(res.captain);
        setRole('captain');
      } else {
        const res = await authApi.getUserProfile();
        setUser(res.user);
        setRole('user');
      }
      setToken(savedToken);
    } catch (err) {
      console.warn('Session restoration failed:', err.message);
      // Clean stale session
      localStorage.removeItem('token');
      localStorage.removeItem('cabgo_role');
      setToken(null);
      setUser(null);
      setCaptain(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // User Login
  const handleUserLogin = async ({ email, password }) => {
    const data = await authApi.loginUser({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('cabgo_role', 'user');
    setToken(data.token);
    setUser(data.user);
    setCaptain(null);
    setRole('user');
    return data;
  };

  // User Register
  const handleUserRegister = async (payload) => {
    const data = await authApi.registerUser(payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('cabgo_role', 'user');
    setToken(data.token);
    setUser(data.user);
    setCaptain(null);
    setRole('user');
    return data;
  };

  // Captain Login
  const handleCaptainLogin = async ({ email, password }) => {
    const data = await authApi.loginCaptain({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('cabgo_role', 'captain');
    setToken(data.token);
    setCaptain(data.captain);
    setUser(null);
    setRole('captain');
    return data;
  };

  // Captain Register
  const handleCaptainRegister = async (payload) => {
    const data = await authApi.registerCaptain(payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('cabgo_role', 'captain');
    setToken(data.token);
    setCaptain(data.captain);
    setUser(null);
    setRole('captain');
    return data;
  };

  // Logout
  const handleLogout = async () => {
    try {
      if (role === 'captain') {
        await authApi.logoutCaptain();
      } else if (role === 'user') {
        await authApi.logoutUser();
      }
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('cabgo_role');
      setToken(null);
      setUser(null);
      setCaptain(null);
      setRole(null);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const updateCurrentCaptain = (updatedCaptain) => {
    setCaptain((prev) => ({ ...prev, ...updatedCaptain }));
  };

  const value = {
    user,
    captain,
    role,
    token,
    isLoading,
    isAuthenticated: !!token && (!!user || !!captain),
    isUser: role === 'user' && !!user,
    isCaptain: role === 'captain' && !!captain,
    loginUser: handleUserLogin,
    registerUser: handleUserRegister,
    loginCaptain: handleCaptainLogin,
    registerCaptain: handleCaptainRegister,
    logout: handleLogout,
    updateUser: updateCurrentUser,
    updateCaptain: updateCurrentCaptain,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
