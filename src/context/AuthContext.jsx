import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getCurrentToken, setCurrentToken } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCurrentToken();
    if (token) {
      const u = getCurrentUser();
      if (u) {
        const { password: _, ...userData } = u;
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (token, userData) => {
    setCurrentToken(token);
    setUser(userData);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const logout = () => {
    setCurrentToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
