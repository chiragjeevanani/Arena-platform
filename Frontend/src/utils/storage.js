/**
 * Returns a prefix for storage keys based on the current module path.
 * This prevents session leakage between User, Admin, Coach, and Arena modules.
 */
export function getStoragePrefix() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return 'admin_';
  if (path.startsWith('/coach')) return 'coach_';
  if (path.startsWith('/arena')) return 'arena_';
  return 'user_'; // Consistent prefix for user module as well
}

/**
 * Gets a prefixed key for localStorage.
 */
export function getPrefixedKey(key) {
  return `${getStoragePrefix()}${key}`;
}

/**
 * Storage wrapper with module-based prefixing.
 */
export const storage = {
  getItem: (key) => localStorage.getItem(getPrefixedKey(key)),
  setItem: (key, value) => localStorage.setItem(getPrefixedKey(key), value),
  removeItem: (key) => localStorage.removeItem(getPrefixedKey(key)),
};
