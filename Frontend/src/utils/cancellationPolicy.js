import { useEffect, useState } from 'react';
import { apiJson } from '../services/apiClient';

/**
 * The Super Admin's cancellation & refund policy, used by every customer-facing text
 * (help FAQ, refund policy, terms, receipt). Texts use {REFUND_HOURS} / {GRACE_MINUTES} tokens.
 */
let policy = { refundHours: 24, graceMinutes: 10 };
let pending = null;

export function getCachedCancellationPolicy() {
  return policy;
}

export function loadCancellationPolicy({ force = false } = {}) {
  if (!pending || force) {
    pending = apiJson('/api/public/policies/cancellation', { method: 'GET', skipAuth: true })
      .then((r) => { if (r?.policy) policy = { ...policy, ...r.policy }; return policy; })
      .catch(() => policy);
  }
  return pending;
}

export function useCancellationPolicy() {
  const [p, setP] = useState(policy);
  useEffect(() => {
    let off = false;
    loadCancellationPolicy().then((v) => { if (!off) setP(v); });
    return () => { off = true; };
  }, []);
  return p;
}

export const hoursText = (h) => (Number(h) === 1 ? '1 hour' : `${h} hours`);
export const minutesText = (m) => (Number(m) === 1 ? '1 minute' : `${m} minutes`);

/** Replace {REFUND_HOURS} / {GRACE_MINUTES} in a string, array of strings, or section objects. */
export function fillPolicy(value, p = policy) {
  if (typeof value === 'string') {
    return value.replace(/\{REFUND_HOURS\}/g, hoursText(p.refundHours)).replace(/\{GRACE_MINUTES\}/g, minutesText(p.graceMinutes));
  }
  if (Array.isArray(value)) return value.map((v) => fillPolicy(v, p));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeof v === 'function' ? v : fillPolicy(v, p)]));
  }
  return value;
}
