import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const users = JSON.parse(localStorage.getItem('dg_users') || '[]');
      const patched = users.map((u) => ({
        ...u,
        name: 'User',
        city: 'Coimbatore',
        deliveryPlatform: u.deliveryPlatform || 'Zomato',
      }));
      localStorage.setItem('dg_users', JSON.stringify(patched));
      const current = patched.find((u) => u.token === token);
      if (current) {
        const { password: _, ...user } = current;
        setUser(user);
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    const cleaned = {
      ...userData,
      name: 'User',
      city: 'Coimbatore',
      deliveryPlatform: userData.deliveryPlatform || 'Zomato',
    };
    // Persist cleaned data back to dg_users
    const users = JSON.parse(localStorage.getItem('dg_users') || '[]');
    const idx = users.findIndex((u) => u.token === token);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...cleaned };
      localStorage.setItem('dg_users', JSON.stringify(users));
    }
    setUser(cleaned);
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      // Sync back to localStorage store
      const users = JSON.parse(localStorage.getItem('dg_users') || '[]');
      const idx = users.findIndex((u) => u.token === localStorage.getItem('token'));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...userData };
        localStorage.setItem('dg_users', JSON.stringify(users));
      }
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
