// ============================================
// SVH AUTH MODULE - React Context
// ============================================
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from './authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const signin = async (loginId, password) => {
    const response = await authService.signin(loginId, password);
    setUser(response.user);
    return response;
  };

  const signup = async (email, username, password) => {
    const response = await authService.completeSignup(email, username, password);
    setUser(response.user);
    return response;
  };

  const signout = () => {
    authService.signout();
    setUser(null);
  };

  const value = {
    user,
    signin,
    signup,
    signout,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};