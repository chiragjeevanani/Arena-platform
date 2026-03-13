import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mock user for SaaS behavior
  const [user, setUser] = useState({
    name: 'Muhammad Haroos',
    role: 'SUPER_ADMIN', 
    assignedArena: 'all', 
    avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
  });

  const login = (userData) => {
    // In a real app, this would verify credentials and return details from a DB
    // For our SaaS demo, we'll transform the mock data to the selected role
    const mockProfile = {
      ...user,
      ...userData,
      name: userData.role === 'SUPER_ADMIN' ? 'Muhammad Haroos' : 'Arena Manager',
      avatar: userData.role === 'SUPER_ADMIN' 
        ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
    };
    setUser(mockProfile);
  };

  const logout = () => setUser(null);

  const hasPermission = (permission) => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
