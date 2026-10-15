const buckets = new Map();

function clearAuthRateLimitBuckets() {
  buckets.clear();
}

function pruneExpired(now) {
  for (const [key, b] of buckets) {
    if (now > b.resetAt) buckets.delete(key);
  }
}

/**
 * Fixed-window per-IP limiter. Each limiter gets its own namespace so a stricter limiter
 * (e.g. OTP endpoints) doesn't share counts with the general auth one.
 */
function createAuthIpRateLimiter({ name = 'auth', max: maxOverride, windowMs: windowOverride } = {}) {
  return function authIpRateLimit(req, res, next) {
    const windowMs = windowOverride || Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
    const max = maxOverride || Number(process.env.AUTH_RATE_LIMIT_MAX) || 100;
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${name}:${ip}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
      // Keep the map from growing without bound.
      if (buckets.size > 50000) pruneExpired(now);
    }
    b.count += 1;
    if (b.count > max) {
      return res.status(429).json({ error: 'Too many requests; try again later' });
    }
    return next();
  };
}

module.exports = { createAuthIpRateLimiter, clearAuthRateLimitBuckets };
