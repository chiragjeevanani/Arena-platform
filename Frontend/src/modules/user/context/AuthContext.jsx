import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mock user for SaaS behavior
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : {
        name: 'Muhammad Haroos',
        role: 'SUPER_ADMIN', 
        assignedArena: 'all', 
        avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
      };
    } catch (e) {
      return null;
    }
  });

  const isLoggedIn = !!user;

  const login = (userData = {}) => {
    // In a real app, this would verify credentials and return details from a DB
    // For our SaaS demo, we'll transform the mock data to the selected role
    const mockProfile = {
      name: userData?.role === 'SUPER_ADMIN' ? 'Muhammad Haroos' : 'Arena Manager',
      avatar: userData?.role === 'SUPER_ADMIN' 
        ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      ...userData,
    };
    setUser(mockProfile);
    localStorage.setItem('user', JSON.stringify(mockProfile));
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userBookings'); 
  };

  const hasPermission = (permission) => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
