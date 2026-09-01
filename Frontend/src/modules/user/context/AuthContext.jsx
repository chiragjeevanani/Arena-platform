/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken, setAuthToken, setRefreshToken, clearAuthTokens } from '../../../services/apiClient';
import { meRequest, logoutRequest } from '../../../services/authApi';
import { storage } from '../../../utils/storage';
import {
  registerServiceWorker,
  requestNotificationPermissionAndGetToken,
  registerFcmTokenOnServer,
  deregisterFcmTokenOnServer,
} from '../../../utils/fcm';

const AuthContext = createContext();

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
    address: u.address || '',
    country: u.country || '',
    location: u.location || '',
    assignedArena: u.assignedArenaId || 'all',
    profilePicture: u.profilePicture || u.avatarUrl || '',
    avatar: u.profilePicture || u.avatarUrl || '',
  };
}

function readStoredUser() {
  try {
    const saved = storage.getItem('user');
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
  const [isLoading, setIsLoading] = useState(() => {
    if (!isApiConfigured()) return false;
    return Boolean(getAuthToken());
  });

  const clearSession = useCallback(() => {
    setUser(null);
    clearAuthTokens();
    storage.removeItem('user');
    storage.removeItem('isLoggedIn');
  }, []);

  useEffect(() => {
    if (!isApiConfigured()) {
      setIsLoading(false);
      return undefined;
    }
    const token = getAuthToken();
    if (!token) {
      queueMicrotask(() => {
        setUser(null);
        setIsLoading(false);
      });
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await meRequest();
        if (cancelled) return;
        const mapped = mapApiUser(data.user);
        setUser(mapped);
        storage.setItem('user', JSON.stringify(mapped));
        storage.setItem('isLoggedIn', 'true');
      } catch (err) {
        // Only a genuine auth rejection (401/403) means the session is actually invalid.
        // A network blip, timeout, or backend error must not log the user out —
        // this previously bounced users straight to /login when returning from a
        // payment gateway redirect after a slow/flaky network round-trip.
        if (!cancelled && (err?.status === 401 || err?.status === 403)) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // apiClient clears tokens itself when a 401 survives a refresh attempt (it has
  // no access to this React state) — listen for that so `user`/isLoggedIn stay in
  // sync instead of the app still believing it's logged in with no valid token,
  // which otherwise 401s on every next call and repeatedly bounces to /login.
  useEffect(() => {
    const onSessionExpired = () => clearSession();
    window.addEventListener('auth:sessionExpired', onSessionExpired);
    return () => window.removeEventListener('auth:sessionExpired', onSessionExpired);
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
        storage.setItem('user', JSON.stringify(mapped));
        storage.setItem('isLoggedIn', 'true');
        setIsLoading(false);
        return;
      }
      setRefreshToken(null);
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(async () => {
    const fcmToken = storage.getItem('fcmToken');
    if (fcmToken) {
      try {
        await deregisterFcmTokenOnServer(fcmToken);
        storage.removeItem('fcmToken');
      } catch (err) {
        console.error('Failed to deregister FCM token on logout:', err);
      }
    }
    await logoutRequest();
    setUser(null);
    storage.removeItem('user');
    storage.removeItem('isLoggedIn');
    storage.removeItem('userBookings');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      try {
        const swReg = await registerServiceWorker();
        if (!active) return;
        const token = await requestNotificationPermissionAndGetToken(swReg);
        if (active && token) {
          storage.setItem('fcmToken', token);
          await registerFcmTokenOnServer(token);
        }
      } catch (err) {
        console.error('FCM setup error:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const hasPermission = useCallback(() => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};
