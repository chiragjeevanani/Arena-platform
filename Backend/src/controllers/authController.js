const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const AuditLog = require('../models/AuditLog');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

function hashOpaqueToken(raw) {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function refreshTokenTtlMs() {
  const n = Number(process.env.REFRESH_TOKEN_TTL_MS);
  if (Number.isFinite(n) && n > 0) return n;
  return 30 * 24 * 60 * 60 * 1000;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterBody(body) {
  const errors = [];
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const name = (body.name || '').trim();

  if (!EMAIL_RE.test(email)) errors.push('Invalid email');
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (name.length < 1) errors.push('Name is required');

  return { ok: errors.length === 0, errors, email, password, name };
}

async function register(req, res) {
  const parsed = validateRegisterBody(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.errors.join('; ') });
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyToken = hashOpaqueToken(verificationToken);
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      role: 'CUSTOMER',
      isEmailVerified: false,
      emailVerifyToken,
      emailVerifyExpires,
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, verificationUrl);

    const response = {
      message: 'Registration successful. Please check your email to verify your account.',
      user: User.toPublic(user),
    };

    if (process.env.EMAIL_VERIFY_RETURN_TOKEN === 'true') {
      response.verificationToken = verificationToken;
    }

    return res.status(201).json(response);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    throw err;
  }
}

async function login(req, res) {
  const rawEmail = typeof req.body.email === 'string' ? req.body.email : '';
  const email = rawEmail.trim().toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPrivileged = ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST'].includes(user.role);
  if (!user.isEmailVerified && !isPrivileged && process.env.REQUIRE_EMAIL_VERIFICATION !== 'false') {
    return res.status(403).json({ error: 'Please verify your email before logging in.' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      jti: crypto.randomBytes(16).toString('hex'),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const rawRefresh = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + refreshTokenTtlMs());
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashOpaqueToken(rawRefresh),
    expiresAt,
  });

  return res.json({
    token,
    refreshToken: rawRefresh,
    user: User.toPublic(user),
  });
}

async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  const tokenHash = hashOpaqueToken(token);
  const user = await User.findOne({
    emailVerifyToken: tokenHash,
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyToken +emailVerifyExpires');

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = null;
  user.emailVerifyExpires = null;
  await user.save();

  return res.json({ message: 'Email verified successfully. You can now log in.' });
}

async function resendVerification(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ error: 'Email is already verified' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerifyToken = hashOpaqueToken(verificationToken);
  user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
  await sendVerificationEmail(user.email, verificationUrl);

  return res.json({ message: 'Verification email resent. Please check your inbox.' });
}

async function me(req, res) {
  const user = await User.findById(req.auth.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ user: User.toPublic(user) });
}

async function refresh(req, res) {
  const raw = req.body.refreshToken;
  if (!raw || typeof raw !== 'string') {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  const tokenHash = hashOpaqueToken(raw);
  const record = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!record) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(record.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      jti: crypto.randomBytes(16).toString('hex'),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return res.json({ token });
}

async function logout(req, res) {
  const raw = req.body.refreshToken;
  if (!raw || typeof raw !== 'string') {
    return res.status(400).json({ error: 'refreshToken is required' });
  }
  await RefreshToken.updateOne(
    { tokenHash: hashOpaqueToken(raw) },
    { $set: { revokedAt: new Date() } }
  );
  return res.json({ ok: true });
}

async function forgotPassword(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email });
  let raw = null;
  if (user && user.isActive) {
    raw = crypto.randomBytes(32).toString('base64url');
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash: hashOpaqueToken(raw),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${raw}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  const response = { ok: true, message: 'If an account exists, a reset link has been sent.' };
  if (raw && process.env.PASSWORD_RESET_RETURN_TOKEN === 'true') {
    response.resetToken = raw;
  }
  return res.json(response);
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'token is required' });
  }
  if (!newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'newPassword is required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const tokenHash = hashOpaqueToken(token);
  const pr = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!pr) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const user = await User.findById(pr.userId).select('+passwordHash');
  if (!user || !user.isActive) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  pr.usedAt = new Date();
  await pr.save();

  await AuditLog.create({
    action: 'password_reset',
    meta: { userId: user._id.toString() },
  });

  return res.json({ ok: true });
}

async function verifyOtp(req, res) {
  const code = String(req.body.code || '').trim();
  if (code.length !== 4 || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ error: 'A 4-digit code is required' });
  }
  if (process.env.DEV_OTP_ENABLED === 'true') {
    const expected = String(process.env.DEV_OTP_CODE || '1234').trim();
    if (code !== expected) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    return res.json({ ok: true, mode: 'dev' });
  }
  return res.status(503).json({
    error: 'SMS OTP is not configured.',
    hint: 'Use email/password login, or set DEV_OTP_ENABLED=true for local development only.',
  });
}

async function coachRegister(req, res) {
  if (process.env.ALLOW_COACH_SELF_REGISTER === 'false') {
    return res.status(403).json({ error: 'Coach self-registration is disabled' });
  }
  const parsed = validateRegisterBody(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.errors.join('; ') });
  }
  try {
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyToken = hashOpaqueToken(verificationToken);
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      role: 'COACH',
      isEmailVerified: false,
      emailVerifyToken,
      emailVerifyExpires,
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, verificationUrl);

    const response = {
      message: 'Registration successful. Please check your email to verify your account.',
      user: User.toPublic(user),
    };

    if (process.env.EMAIL_VERIFY_RETURN_TOKEN === 'true') {
      response.verificationToken = verificationToken;
    }

    return res.status(201).json(response);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    throw err;
  }
}

module.exports = {
  register,
  login,
  me,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  coachRegister,
  verifyEmail,
  resendVerification,
};
