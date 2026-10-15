/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '../../../utils/storage';
import { isSlotTimePassed } from '../../../utils/slotTime';
import { useAuth } from './AuthContext';

/**
 * Booking cart: court slots from any court / date, checked out together.
 * Items are NOT held on the server — availability is re-checked on the cart page
 * and the server rejects any slot someone else paid for first.
 *
 * Item shape:
 *   { key, arenaId, arenaName, arenaImage, arenaLocation, courtId, courtName, courtType,
 *     date (Date#toDateString), dateYmd, timeSlot, price, pricing, addedAt }
 */

const STORAGE_KEY = 'bookingCart';
export const MAX_CART_ITEMS = 20; // matches the backend's per-payment booking limit

const CartContext = createContext(null);

export const cartItemKey = ({ courtId, dateYmd, timeSlot }) => `${courtId}|${dateYmd}|${timeSlot}`;

function isExpired(item, now = new Date()) {
  return isSlotTimePassed(item.date, item.timeSlot, now);
}

function readCart() {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || !Array.isArray(parsed.items)) return { ownerId: null, items: [] };
    return { ownerId: parsed.ownerId ?? null, items: parsed.items };
  } catch {
    return { ownerId: null, items: [] };
  }
}

export function sortCartItems(items) {
  return [...items].sort((a, b) =>
    String(a.dateYmd).localeCompare(String(b.dateYmd)) ||
    String(a.courtName).localeCompare(String(b.courtName)) ||
    String(a.timeSlot).localeCompare(String(b.timeSlot)),
  );
}

export const CartProvider = ({ children }) => {
  const { user, isLoading } = useAuth();
  const userId = user?.id ?? null;
  const [cart, setCart] = useState(readCart);
  // Latest cart for event handlers (addItems needs a synchronous result).
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // A cart belongs to whoever filled it. A guest cart is adopted on login;
  // a different account's cart is discarded rather than leaked.
  useEffect(() => {
    if (isLoading) return;
     
    setCart((prev) => {
      if (prev.ownerId === userId) return prev;
      // Logged out → start an empty guest cart; logged in → adopt a guest cart only.
      if (!userId) return { ownerId: null, items: [] };
      return { ownerId: userId, items: prev.ownerId ? [] : prev.items };
    });
  }, [userId, isLoading]);

  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* storage full / private mode — cart just won't survive a reload */
    }
  }, [cart]);

  // Drop slots whose start time has passed (on load and every minute).
  useEffect(() => {
    const prune = () =>
      setCart((prev) => {
        const now = new Date();
        const kept = prev.items.filter((i) => !isExpired(i, now));
        return kept.length === prev.items.length ? prev : { ...prev, items: kept };
      });
    prune();
    const t = setInterval(prune, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  /** Adds items (deduped by court+date+slot). Returns how many were actually added. */
  const addItems = useCallback((newItems) => {
    const prev = cartRef.current;
    const keys = new Set(prev.items.map((i) => i.key));
    const next = [...prev.items];
    let added = 0;
    for (const raw of newItems) {
      const item = { ...raw, key: cartItemKey(raw), addedAt: Date.now() };
      if (keys.has(item.key) || isExpired(item) || next.length >= MAX_CART_ITEMS) continue;
      keys.add(item.key);
      next.push(item);
      added += 1;
    }
    if (added) {
      cartRef.current = { ...prev, items: next };
      setCart(cartRef.current);
    }
    return added;
  }, []);

  const removeItem = useCallback((key) => {
    setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.key !== key) }));
  }, []);

  const removeItems = useCallback((keys) => {
    const drop = new Set(keys);
    setCart((prev) => ({ ...prev, items: prev.items.filter((i) => !drop.has(i.key)) }));
  }, []);

  const updateItems = useCallback((updates) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) => (updates[i.key] ? { ...i, ...updates[i.key] } : i)),
    }));
  }, []);

  const clearCart = useCallback(() => setCart((prev) => ({ ...prev, items: [] })), []);

  const value = useMemo(() => {
    const items = sortCartItems(cart.items);
    const keys = new Set(items.map((i) => i.key));
    return {
      items,
      count: items.length,
      total: items.reduce((s, i) => s + (Number(i.price) || 0), 0),
      isFull: items.length >= MAX_CART_ITEMS,
      has: (item) => keys.has(item.key || cartItemKey(item)),
      addItems,
      removeItem,
      removeItems,
      updateItems,
      clearCart,
    };
  }, [cart.items, addItems, removeItem, removeItems, updateItems, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
