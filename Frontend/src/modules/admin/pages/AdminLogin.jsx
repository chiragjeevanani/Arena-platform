import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { sendLoginOtpRequest, verifyEmailOtpRequest } from '../../../services/authApi';
import Logo from '../../../assets/Logo (3).png';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  // OTP Login States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  /** Used only when VITE_API_URL is unset (mock demo). */
  const [mockRole, setMockRole] = useState('SUPER_ADMIN');

  useEffect(() => {
    let interval = null;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`admin-login-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`admin-login-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtpError('');
    try {
      await sendLoginOtpRequest(email.trim().toLowerCase());
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('admin-login-otp-0');
      if (firstInput) firstInput.focus();
    } catch (err) {
      setOtpError(err.message || 'Failed to resend login OTP');
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter the full 6-digit OTP code');
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyEmailOtpRequest(email.trim().toLowerCase(), code);
      const role = data.user?.role;
      const adminRoles = ['ARENA_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'];
      if (!adminRoles.includes(role)) {
        setOtpError('This account is not an admin user.');
        return;
      }
      login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      if (role === 'ARENA_ADMIN' || role === 'RECEPTIONIST') {
        navigate('/arena');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (isApiConfigured()) {
      try {
        await sendLoginOtpRequest(email.trim().toLowerCase());
        setIsOtpSent(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        setError(err.message || 'Failed to send OTP code');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mock Mode
    setTimeout(() => {
      setIsLoading(false);
      login({
        role: mockRole,
        assignedArena: mockRole === 'ARENA_ADMIN' ? 'arena-1' : 'all',
      });
      if (mockRole === 'ARENA_ADMIN') {
        navigate('/arena');
      } else {
        navigate('/admin');
      }
    }, 1200);
  };

  const inputCls = "w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#CE2029]/50";

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#CE2029]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#36454F]/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full md:max-w-[380px] bg-transparent md:bg-white md:p-7 md:rounded-[2rem] rounded-[40px] md:shadow-[0_40px_100px_rgba(15,23,42,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-5">
          {isOtpSent ? (
            <div className="text-center py-4 space-y-6">
              <button 
                onClick={() => setIsOtpSent(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft size={16} /> Edit Email
              </button>

              <div className="w-16 h-16 bg-[#CE2029]/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield className="text-[#CE2029] w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Enter OTP Code</h1>
                <p className="text-slate-500 text-xs font-medium px-2 leading-relaxed">
                  We've sent a 6-digit verification code to <br />
                  <span className="text-[#0F172A] font-bold">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                {otpError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-xs font-semibold text-red-800">
                    {otpError}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`admin-login-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-13 bg-white/70 border-2 border-slate-100 backdrop-blur-md rounded-xl text-center text-xl font-black text-[#0F172A] shadow-inner focus:border-[#CE2029] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CE2029]/5 transition-all outline-none"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`text-xs font-bold transition-all ${
                      resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#CE2029] hover:underline'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP code'}
                  </button>
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={verifying}
                  className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60 shadow-lg shadow-[#CE2029]/20"
                >
                  {verifying ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> VERIFYING...</>
                  ) : (
                    'VERIFY & ENTER TERMINAL'
                  )}
                </motion.button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-1">
                  <img src={Logo} alt="AMM Sports" className="w-28 h-28 object-contain" />
                </div>
                <div className="w-full max-w-[110px] aspect-square mx-auto mb-1 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
                  <Lottie 
                    animationData={badmintonLottie} 
                    loop={true} 
                    className="w-full h-full"
                  />
                </div>
                <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Admin Terminal</h1>
                <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Initialize secure administrative session</p>
              </div>

              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                {error && (
                  <p className="text-xs text-red-600 font-semibold text-center">{error}</p>
                )}

                {/* Email */}
                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Access Identifier</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Mock Role Selector (Demo Mode only) */}
                {!isApiConfigured() && (
                  <div className="group">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Demo Role (No API)</label>
                    <select
                      value={mockRole}
                      onChange={e => setMockRole(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-[#36454F] outline-none"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="ARENA_ADMIN">ARENA_ADMIN</option>
                      <option value="RECEPTIONIST">RECEPTIONIST</option>
                    </select>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60 shadow-lg shadow-[#CE2029]/20 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Get OTP Code <ArrowRight size={14} strokeWidth={2.5} /></>
                  )}
                </motion.button>
              </form>

              <div className="text-center pt-3 border-t border-slate-50">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center justify-center gap-2">
                  <Shield size={12} strokeWidth={2.5} className="text-[#CE2029]" /> 
                  Secure Access Node · AMM Sports © 2026
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
