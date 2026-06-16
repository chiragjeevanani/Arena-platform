const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Resend sends email via HTTPS (port 443), which is never blocked by cloud hosts.
// This replaces the SMTP approach which Render blocks at the network level.
let resend = null;
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Arena CRM <onboarding@resend.dev>';

async function sendEmail({ to, subject, html }) {
  const resendInstance = getResend();
  
  if (resendInstance) {
    const { error } = await resendInstance.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    
    if (error) {
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  } else {
    // Fallback to Nodemailer if no Resend API key is provided
    try {
      await getTransporter().sendMail({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
      });
    } catch (err) {
      throw new Error(`Failed to send email via SMTP: ${err.message}`);
    }
  }
}

async function sendVerificationEmail(to, otp) {
  const html = `
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
  `;

  await sendEmail({ to, subject: 'Verify Your Email - Arena CRM', html });
}

async function sendPasswordResetEmail(to, otp) {
  const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Password Reset Request</h2>
          <p style="color: #64748B; font-size: 14px; margin: 8px 0 0 0;">You requested to reset your password. Use the OTP below to set a new password.</p>
        </div>
        <div style="background-color: #FFF1F1; border: 1px solid #FCA5A5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="color: #CE2029; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">Your Reset OTP</p>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #CE2029; margin: 0; padding-left: 8px;">${otp}</div>
        </div>
        <p style="color: #64748B; font-size: 13px; text-align: center; line-height: 1.5; margin: 0 0 20px 0;">
          Enter this code on the password reset page to set your new password. 
          <br />
          <strong style="color: #334155;">This OTP code will expire in 15 minutes.</strong>
        </p>
        <hr style="border: 0; border-top: 1px solid #F1F5F9; margin: 24px 0;">
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
  `;

  await sendEmail({ to, subject: 'Reset Your Password - Arena CRM', html });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
