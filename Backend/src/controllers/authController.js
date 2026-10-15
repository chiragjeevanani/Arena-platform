const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const AuditLog = require('../models/AuditLog');
const Referral = require('../models/Referral');
const ReferralSettings = require('../models/ReferralSettings');
const StaffAttendance = require('../models/StaffAttendance');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { invalidateAccountCache } = require('../middleware/auth');

function hashOpaqueToken(raw) {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function refreshTokenTtlMs() {
  const n = Number(process.env.REFRESH_TOKEN_TTL_MS);
  if (Number.isFinite(n) && n > 0) return n;
  return 30 * 24 * 60 * 60 * 1000;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Demo / QA shortcuts. Off unless DEMO_LOGIN_ENABLED=true is set on the server.
const DEMO_EMAILS = ['coach@gmail.com', 'arenaadmin@gmail.com', 'superadmin@gmail.com', 'chirag@gmail.com', 'user@gmail.com', 'customer@gmail.com'];
const DEMO_OTP_EMAILS = ['coach@gmail.com', 'arenaadmin@gmail.com', 'superadmin@gmail.com'];
const DEMO_PASSWORD = '12345678';
const DEMO_OTP = '123456';

function isDemoLoginEnabled() {
  return process.env.DEMO_LOGIN_ENABLED === 'true';
}

/** 6-digit one-time code from a cryptographically secure source. */
function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

// Per-email cap on wrong OTP guesses (a 6-digit code is otherwise brute-forceable).
const OTP_MAX_FAILURES = 5;
const otpFailures = new Map();

function otpLockedOut(key) {
  const entry = otpFailures.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    otpFailures.delete(key);
    return false;
  }
  return entry.count >= OTP_MAX_FAILURES;
}

function recordOtpFailure(key) {
  const now = Date.now();
  const entry = otpFailures.get(key);
  if (!entry || now > entry.resetAt) {
    otpFailures.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
  if (otpFailures.size > 10000) {
    for (const [k, v] of otpFailures) if (now > v.resetAt) otpFailures.delete(k);
  }
}

function validateRegisterBody(body) {
  const errors = [];
  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || '').trim();
  const password = (body.password || '');

  if (!EMAIL_RE.test(email)) errors.push('Invalid email');
  if (name.length < 1) errors.push('Name is required');
  if (password.length < 8) errors.push('Password must be at least 8 characters');

  return { ok: errors.length === 0, errors, email, name, password };
}

async function register(req, res) {
  const parsed = validateRegisterBody(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.errors.join('; ') });
  }

  try {
    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    let referredByUser = null;
    let settings = null;
    if (req.body.referralCode) {
      settings = await ReferralSettings.getSettings();
      if (settings.referralSystemEnabled) {
        referredByUser = await User.findOne({ referralCode: String(req.body.referralCode).trim() });
        if (!referredByUser) {
          return res.status(400).json({ error: 'Invalid referral code' });
        }
        if (referredByUser.email.toLowerCase() === parsed.email.toLowerCase()) {
          return res.status(400).json({ error: 'You cannot refer yourself' });
        }
      }
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const verificationToken = generateOtp();
    const emailVerifyToken = hashOpaqueToken(verificationToken);
    const emailVerifyExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes OTP expiry

    // Delete any stale pending registration for this email
    await PendingUser.deleteOne({ email: parsed.email });

    const phone = req.body.phone ? String(req.body.phone).trim().slice(0, 32) : '';
    const address = req.body.address ? String(req.body.address).trim().slice(0, 200) : '';
    const country = req.body.country ? String(req.body.country).trim().slice(0, 100) : '';
    const location = req.body.location ? String(req.body.location).trim().slice(0, 100) : (address && country ? `${address}, ${country}` : address || country || '');
    const profilePicture = req.body.profilePicture ? String(req.body.profilePicture).trim() : (req.body.avatarUrl ? String(req.body.avatarUrl).trim() : '');

    const pendingUser = await PendingUser.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      phone,
      address,
      country,
      location,
      profilePicture,
      role: 'CUSTOMER',
      emailVerifyToken,
      emailVerifyExpires,
      referredBy: referredByUser ? referredByUser._id : null,
      referralCode: req.body.referralCode ? String(req.body.referralCode).trim() : null,
    });

    await sendVerificationEmail(pendingUser.email, verificationToken);

    const response = {
      message: 'Registration successful. Please check your email for the OTP code to verify your account.',
      user: User.toPublic(pendingUser),
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

  let user = await User.findOne({ email }).select('+passwordHash');

  // Demo accounts are auto-created ONLY when explicitly enabled (local/staging), and only
  // for this fixed list. Previously any new email with password 12345678 was provisioned
  // (as SUPER_ADMIN if the email contained "admin"), and any existing account — admins
  // included — accepted 12345678 as its password.
  if (!user && isDemoLoginEnabled() && DEMO_EMAILS.includes(email) && password === DEMO_PASSWORD) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const role = email.includes('admin') ? 'SUPER_ADMIN' : email.includes('coach') ? 'COACH' : 'CUSTOMER';
    const rawName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'User';
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    user = await User.create({
      email,
      passwordHash,
      name,
      role,
      isEmailVerified: true,
      isActive: true,
    });
  }

  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPrivileged = ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST'].includes(user.role);
  if (!user.isEmailVerified && !isPrivileged && process.env.REQUIRE_EMAIL_VERIFICATION !== 'false') {
    return res.status(403).json({ error: 'Please verify your email before logging in.' });
  }

  const match = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

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

  // Auto-log attendance for Arena Admin / Receptionist on successful login
  if (['ARENA_ADMIN', 'RECEPTIONIST'].includes(user.role) && user.assignedArenaId) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const existing = await StaffAttendance.findOne({
        staffId: user._id,
        arenaId: user.assignedArenaId,
        date: todayStr,
      });
      if (!existing) {
        const d = new Date();
        const nowTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        await StaffAttendance.create({
          staffId: user._id,
          arenaId: user.assignedArenaId,
          date: todayStr,
          checkIn: nowTime,
          status: 'present',
          markedBy: user._id,
          remarks: 'Auto-logged on Login',
        });
      }
    } catch (attErr) {
      console.error('Failed to auto-log login attendance:', attErr);
    }
  }

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
  let user = await User.findOne({
    emailVerifyToken: tokenHash,
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyToken +emailVerifyExpires');

  if (user) {
    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    await user.save();
    return res.json({ message: 'Email verified successfully. You can now log in.' });
  }

  const pendingUser = await PendingUser.findOne({
    emailVerifyToken: tokenHash,
    emailVerifyExpires: { $gt: new Date() },
  });

  if (!pendingUser) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }

  user = await User.create({
    email: pendingUser.email,
    passwordHash: pendingUser.passwordHash,
    name: pendingUser.name,
    phone: pendingUser.phone || '',
    address: pendingUser.address || '',
    country: pendingUser.country || '',
    location: pendingUser.location || '',
    profilePicture: pendingUser.profilePicture || pendingUser.avatarUrl || '',
    role: pendingUser.role,
    isEmailVerified: true,
  });

  if (pendingUser.referredBy) {
    const settings = await ReferralSettings.getSettings();
    if (settings && settings.referralSystemEnabled) {
      await Referral.create({
        referrerId: pendingUser.referredBy,
        referredUserId: user._id,
        referralCode: pendingUser.referralCode,
        rewardAmountReferrer: settings.referrerReward,
        rewardAmountReferred: settings.newuserReward,
        expiryDate: new Date(Date.now() + settings.referralExpiryDays * 24 * 60 * 60 * 1000),
      });
    }
  }

  await PendingUser.deleteOne({ _id: pendingUser._id });

  return res.json({ message: 'Email verified successfully. You can now log in.' });
}

async function resendVerification(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (user) {
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = generateOtp();
    user.emailVerifyToken = hashOpaqueToken(verificationToken);
    user.emailVerifyExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes OTP expiry
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    return res.json({ message: 'Verification OTP code resent. Please check your inbox.' });
  }

  const pendingUser = await PendingUser.findOne({ email });
  if (!pendingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const verificationToken = generateOtp();
  pendingUser.emailVerifyToken = hashOpaqueToken(verificationToken);
  pendingUser.emailVerifyExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes OTP expiry
  pendingUser.createdAt = new Date(); // Reset creation time to extend TTL index expiration
  await pendingUser.save();

  await sendVerificationEmail(pendingUser.email, verificationToken);

  return res.json({ message: 'Verification OTP code resent. Please check your inbox.' });
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
  let otpCode = null;
  if (user && user.isActive) {
    otpCode = generateOtp();
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash: hashOpaqueToken(otpCode),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry for OTP
    });

    await sendPasswordResetEmail(user.email, otpCode);
  }

  const response = { ok: true, message: 'If an account exists, a reset link has been sent.' };
  if (otpCode && process.env.PASSWORD_RESET_RETURN_TOKEN === 'true') {
    response.resetToken = otpCode;
  }
  return res.json(response);
}

async function resetPassword(req, res) {
  const { otp, newPassword } = req.body;
  if (!otp || typeof otp !== 'string') {
    return res.status(400).json({ error: 'otp is required' });
  }
  if (!newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'newPassword is required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Email is optional for older app builds; when sent, the code must belong to that account.
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const lockKey = `reset:${email || req.ip}`;
  if (otpLockedOut(lockKey)) {
    return res.status(429).json({ error: 'Too many incorrect codes. Request a new code and try again later.' });
  }

  const tokenHash = hashOpaqueToken(otp.trim());
  const query = { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } };
  if (email) {
    const owner = await User.findOne({ email }).select('_id').lean();
    query.userId = owner ? owner._id : null;
  }
  const pr = await PasswordResetToken.findOne(query);
  if (!pr) {
    recordOtpFailure(lockKey);
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const user = await User.findById(pr.userId).select('+passwordHash');
  if (!user || !user.isActive) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Burn the code first so it can't be replayed by a concurrent request.
  const claimed = await PasswordResetToken.findOneAndUpdate(
    { _id: pr._id, usedAt: null },
    { $set: { usedAt: new Date() } }
  );
  if (!claimed) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  // A password reset signs out every other session.
  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

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

async function verifyEmailOtp(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  const otp = (req.body.otp || '').trim();

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  let user;

  // Fixed demo OTP only when demo login is explicitly enabled (never in production).
  if (isDemoLoginEnabled() && DEMO_OTP_EMAILS.includes(email) && otp === DEMO_OTP) {
    user = await User.findOne({ email }).select('+emailVerifyToken +emailVerifyExpires');
    if (!user) {
      return res.status(400).json({ error: 'Mock user not found' });
    }
    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    await user.save();
  } else {
    const lockKey = `verify:${email}`;
    if (otpLockedOut(lockKey)) {
      return res.status(429).json({ error: 'Too many incorrect codes. Request a new code and try again later.' });
    }
    const tokenHash = hashOpaqueToken(otp);
    user = await User.findOne({
      email,
      emailVerifyToken: tokenHash,
      emailVerifyExpires: { $gt: new Date() },
    }).select('+emailVerifyToken +emailVerifyExpires');

    if (user && !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user) {
      user.isEmailVerified = true;
      user.emailVerifyToken = null;
      user.emailVerifyExpires = null;
      await user.save();
    } else {
      const pendingUser = await PendingUser.findOne({
        email,
        emailVerifyToken: tokenHash,
        emailVerifyExpires: { $gt: new Date() },
      });

      if (!pendingUser) {
        recordOtpFailure(lockKey);
        return res.status(400).json({ error: 'Invalid or expired OTP code' });
      }

      user = await User.create({
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        name: pendingUser.name,
        phone: pendingUser.phone || '',
        address: pendingUser.address || '',
        country: pendingUser.country || '',
        location: pendingUser.location || '',
        profilePicture: pendingUser.profilePicture || pendingUser.avatarUrl || '',
        role: pendingUser.role,
        isEmailVerified: true,
      });

      if (pendingUser.referredBy) {
        const settings = await ReferralSettings.getSettings();
        if (settings && settings.referralSystemEnabled) {
          await Referral.create({
            referrerId: pendingUser.referredBy,
            referredUserId: user._id,
            referralCode: pendingUser.referralCode,
            rewardAmountReferrer: settings.referrerReward,
            rewardAmountReferred: settings.newuserReward,
            expiryDate: new Date(Date.now() + settings.referralExpiryDays * 24 * 60 * 60 * 1000),
          });
        }
      }

      await PendingUser.deleteOne({ _id: pendingUser._id });
    }
  }

  // Log audit
  await AuditLog.create({
    action: 'email_verified_otp',
    meta: { userId: user._id.toString(), email: user.email },
  }).catch(() => {});

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
    message: 'Email verified successfully.',
    token,
    refreshToken: rawRefresh,
    user: User.toPublic(user),
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
    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const verificationToken = generateOtp();
    const emailVerifyToken = hashOpaqueToken(verificationToken);
    const emailVerifyExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes OTP expiry

    // Delete any stale pending registration for this email
    await PendingUser.deleteOne({ email: parsed.email });

    const pendingUser = await PendingUser.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      role: 'COACH',
      emailVerifyToken,
      emailVerifyExpires,
    });

    await sendVerificationEmail(pendingUser.email, verificationToken);

    const response = {
      message: 'Registration successful. Please check your email for the OTP code to verify your account.',
      user: User.toPublic(pendingUser),
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

async function sendLoginOtp(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid email address' });
  }

  if (isDemoLoginEnabled() && DEMO_OTP_EMAILS.includes(email)) {
    return res.json({ message: `Mock login OTP code enabled for demo. Use ${DEMO_OTP}.` });
  }

  const verificationToken = generateOtp();
  user.emailVerifyToken = hashOpaqueToken(verificationToken);
  user.emailVerifyExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes OTP expiry
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);

  return res.json({ message: 'Login OTP code sent. Please check your inbox.' });
}

async function deleteAccount(req, res) {
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!password) {
    return res.status(400).json({ error: 'Password is required to delete your account' });
  }

  const user = await User.findById(req.auth.sub).select('+passwordHash');
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const match = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!match) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  user.isActive = false;
  user.email = `deleted+${user._id}@deleted.account`;
  user.passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  user.fcmTokens = [];
  await user.save();
  invalidateAccountCache(user._id);

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

  await AuditLog.create({
    action: 'account_deleted',
    meta: { userId: user._id.toString() },
  }).catch(() => {});

  return res.json({ ok: true });
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
  verifyEmailOtp,
  sendLoginOtp,
  resendVerification,
  deleteAccount,
};
