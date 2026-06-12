import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import Logo from '../../../assets/Logo (3).png';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { sendLoginOtpRequest, verifyEmailOtpRequest } from '../../../services/authApi';

const DEMO_ARENA_ID = '507f1f77bcf86cd799439011';

const ArenaLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Login States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

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
      const nextInput = document.getElementById(`arena-login-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`arena-login-otp-${index - 1}`);
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
      const firstInput = document.getElementById('arena-login-otp-0');
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
      const arenaRoles = ['ARENA_ADMIN', 'RECEPTIONIST'];
      if (!arenaRoles.includes(role)) {
        setOtpError('This portal is for arena staff (arena admin or receptionist) only.');
        return;
      }
      login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      navigate('/arena');
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isApiConfigured()) {
      setLoading(true);
      try {
        await sendLoginOtpRequest(email.trim().toLowerCase());
        setIsOtpSent(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        setError(err.message || 'Failed to send OTP code');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({
        token: 'mock-arena-token',
        user: {
          id: '507f191e810c19729de860ea',
          email,
          name: 'Demo Arena Manager',
          role: 'ARENA_ADMIN',
          assignedArenaId: DEMO_ARENA_ID,
        },
      });
      navigate('/arena');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#CE2029]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#243B53]/5 rounded-full blur-[100px]" />

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
                <Mail className="text-[#CE2029] w-8 h-8" />
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
                      id={`arena-login-otp-${index}`}
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

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={verifying}
                  className="bg-[#CE2029] hover:bg-[#d43b33] py-3.5 shadow-lg shadow-[#CE2029]/20 active:scale-95 transition-all"
                  sx={{
                    borderRadius: '18px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    letterSpacing: '0.15em',
                    backgroundColor: '#CE2029',
                    paddingY: '14px'
                  }}
                >
                  {verifying ? 'VERIFYING...' : 'VERIFY & ENTER PORTAL'}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-1">
                  <img src={Logo} alt="AMM Sports" className="w-14 h-14 object-contain" />
                </div>
                <div className="w-full max-w-[110px] aspect-square mx-auto mb-1 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
                  <Lottie 
                    animationData={badmintonLottie} 
                    loop={true} 
                    className="w-full h-full"
                  />
                </div>
                <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Arena Portal</h1>
                <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Sign in to manage your arena</p>
              </div>

              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                {/* Email */}
                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="arena@example.com"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#CE2029]/50"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                    {error}
                  </motion.p>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60 shadow-lg shadow-[#CE2029]/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Get OTP Code <ArrowRight size={14} strokeWidth={2.5} /></>
                  )}
                </motion.button>
              </form>

              <div className="text-center space-y-3 pt-3 border-t border-slate-50">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Not an arena manager?{' '}
                  <button onClick={() => navigate('/admin/login')} className="text-[#CE2029] font-black underline underline-offset-4">Admin Login</button>
                </p>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  AMM Sports Network © 2026
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ArenaLogin;
