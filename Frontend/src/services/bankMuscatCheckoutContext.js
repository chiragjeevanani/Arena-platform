const STORAGE_KEY = 'arena_bank_muscat_pending_context';
// localStorage (not sessionStorage): the bank page can open in a new browser context, which
// starts with an empty sessionStorage and lost the booking details on return.

/**
 * Save checkout UI context before redirecting to Bank Muscat.
 * Restored on /payment/bank-muscat/return → /booking-success.
 */
export function saveBankMuscatCheckoutContext(context = {}) {
  try {
    const payload = {
      ...context,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function peekBankMuscatCheckoutContext() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.savedAt && Date.now() - Number(parsed.savedAt) > 2 * 60 * 60 * 1000) {
      return null;
    }
    const copy = { ...parsed };
    delete copy.savedAt;
    return copy;
  } catch {
    return null;
  }
}

export function consumeBankMuscatCheckoutContext() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    localStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    // Drop stale context older than 2 hours
    if (parsed.savedAt && Date.now() - Number(parsed.savedAt) > 2 * 60 * 60 * 1000) {
      return null;
    }
    delete parsed.savedAt;
    return parsed;
  } catch {
    return null;
  }
}
