const buckets = new Map();

function clearAuthRateLimitBuckets() {
  buckets.clear();
}

function createAuthIpRateLimiter() {
  return function authIpRateLimit(req, res, next) {
    const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
    const max = Number(process.env.AUTH_RATE_LIMIT_MAX) || 100;
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) {
      return res.status(429).json({ error: 'Too many requests; try again later' });
    }
    return next();
  };
}

module.exports = { createAuthIpRateLimiter, clearAuthRateLimitBuckets };
