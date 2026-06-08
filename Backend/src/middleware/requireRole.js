function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.auth.role === 'SUPER_ADMIN' || allowedRoles.includes(req.auth.role)) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { requireRole };
