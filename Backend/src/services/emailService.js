const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const mailConfig = {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // If using Gmail, it is highly recommended to let nodemailer use the built-in 'gmail' service configuration,
  // which handles ports, TLS, and fallback options automatically to prevent connection timeouts on cloud hosts.
  if (process.env.SMTP_SERVICE === 'gmail' || process.env.SMTP_HOST === 'smtp.gmail.com') {
    mailConfig.service = 'gmail';
  } else {
    mailConfig.host = process.env.SMTP_HOST;
    mailConfig.port = parseInt(process.env.SMTP_PORT || '587');
    mailConfig.secure = process.env.SMTP_SECURE === 'true';
  }

  // Add TLS settings to prevent socket close/timeout issues on standard cloud environments
  mailConfig.tls = {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  };

  // Add socket timeout settings to fail faster/retry or debug better
  mailConfig.connectionTimeout = 10000; // 10 seconds
  mailConfig.greetingTimeout = 10000;
  mailConfig.socketTimeout = 10000;

  transporter = nodemailer.createTransport(mailConfig);
  return transporter;
}

async function sendVerificationEmail(to, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify Your Email - Arena CRM',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Arena!</h2>
          <p style="color: #64748B; font-size: 14px; margin: 8px 0 0 0;">Please verify your email address to activate your account</p>
        </div>
        <div style="background-color: #FFF1F1; border: 1px solid #FCA5A5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="color: #CE2029; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">Your Verification OTP</p>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #CE2029; margin: 0; padding-left: 8px;">${otp}</div>
        </div>
        <p style="color: #64748B; font-size: 13px; text-align: center; line-height: 1.5; margin: 0 0 20px 0;">
          Enter this code on the registration page to activate your account. 
          <br />
          <strong style="color: #334155;">This OTP code will expire in 15 minutes.</strong>
        </p>
        <hr style="border: 0; border-top: 1px solid #F1F5F9; margin: 24px 0;">
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          If you did not sign up for an Arena account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  return getTransporter().sendMail(mailOptions);
}

async function sendPasswordResetEmail(to, resetUrl) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Reset Your Password - Arena CRM',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  return getTransporter().sendMail(mailOptions);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
