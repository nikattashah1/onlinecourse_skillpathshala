import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('oclp_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('oclp_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('oclp_token', token);
    } else {
      localStorage.removeItem('oclp_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('oclp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('oclp_user');
    }
  }, [user]);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

