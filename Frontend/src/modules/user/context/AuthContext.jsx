import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mock user for SaaS behavior
<<<<<<< HEAD
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
=======
  const [user, setUser] = useState({
    name: 'Muhammad Haroos',
    role: 'SUPER_ADMIN', 
    assignedArena: 'all', 
    avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const login = (userData) => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');

    if (userData) {
      const mockProfile = {
        ...user,
        ...userData,
        name: userData.role === 'SUPER_ADMIN' ? 'Muhammad Haroos' : 'Arena Manager',
        avatar: userData.role === 'SUPER_ADMIN' 
          ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
      };
      setUser(mockProfile);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userBookings'); // Optional: clear bookings on logout
>>>>>>> 9c6d11666734624fede573fdcd6d4860aed90564
  };

  const hasPermission = (permission) => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return false;
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, login, logout, hasPermission }}>
=======
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, login, logout, hasPermission }}>
>>>>>>> 9c6d11666734624fede573fdcd6d4860aed90564
      {children}
    </AuthContext.Provider>
  );
};
