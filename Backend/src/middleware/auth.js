const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Access tokens live for days, so a token alone can't tell us an account was deactivated,
 * deleted or had its role changed. Every authenticated request checks the account
 * (cached briefly to keep this off the hot path) and uses the role from the database.
 */
const ACCOUNT_CACHE_MS = 30 * 1000;
const accountCache = new Map();

async function loadAccount(userId) {
  const now = Date.now();
  const hit = accountCache.get(userId);
  if (hit && hit.expires > now) return hit.account;

  const user = mongoose.isValidObjectId(userId)
    ? await User.findById(userId).select('isActive role').lean()
    : null;
  const account = user ? { isActive: user.isActive !== false, role: user.role } : null;
  accountCache.set(userId, { account, expires: now + ACCOUNT_CACHE_MS });
  if (accountCache.size > 20000) {
    for (const [k, v] of accountCache) if (v.expires <= now) accountCache.delete(k);
  }
  return account;
}

/** Drop a cached account so a deactivation / role change applies immediately. */
function invalidateAccountCache(userId) {
  accountCache.delete(String(userId));
}

function readToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const payload = readToken(req);
  if (!payload?.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const account = await loadAccount(String(payload.sub));
    if (!account || !account.isActive) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.auth = { sub: payload.sub, role: account.role || payload.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

async function optionalAuth(req, res, next) {
  const payload = readToken(req);
  if (!payload?.sub) return next();
  try {
    const account = await loadAccount(String(payload.sub));
    if (account && account.isActive) {
      req.auth = { sub: payload.sub, role: account.role || payload.role };
    }
  } catch {
    // Continue as anonymous if the lookup fails
  }
  return next();
}

module.exports = { requireAuth, optionalAuth, invalidateAccountCache };
