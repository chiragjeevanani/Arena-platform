import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken, setAuthToken, setRefreshToken, clearAuthTokens } from '../../../services/apiClient';
import { meRequest, logoutRequest } from '../../../services/authApi';

const AuthContext = createContext();

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function mapApiUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    phone: u.phone || '',
    assignedArena: u.assignedArenaId || 'all',
    avatar: u.avatarUrl || DEFAULT_AVATAR,
  };
}

function readStoredUser() {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function readInitialUser() {
  const token = isApiConfigured() ? getAuthToken() : null;
  if (isApiConfigured() && !token) return null;
  const u = readStoredUser();
  if (u && u.role) return u;
  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readInitialUser);

  const clearSession = useCallback(() => {
    setUser(null);
    clearAuthTokens();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  }, []);

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    const token = getAuthToken();
    if (!token) {
      queueMicrotask(() => setUser(null));
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await meRequest();
        if (cancelled) return;
        const mapped = mapApiUser(data.user);
        setUser(mapped);
        localStorage.setItem('user', JSON.stringify(mapped));
        localStorage.setItem('isLoggedIn', 'true');
      } catch {
        if (!cancelled) clearSession();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const isLoggedIn = !!user;

  const login = useCallback(
    (payload = {}) => {
      if (payload.token && payload.user) {
        setAuthToken(payload.token);
        if (payload.refreshToken) {
          setRefreshToken(payload.refreshToken);
        } else {
          setRefreshToken(null);
        }
        const mapped = mapApiUser(payload.user);
        setUser(mapped);
        localStorage.setItem('user', JSON.stringify(mapped));
        localStorage.setItem('isLoggedIn', 'true');
        return;
      }
      setRefreshToken(null);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userBookings');
  }, []);

  const hasPermission = useCallback(() => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};
