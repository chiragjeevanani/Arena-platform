import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment } from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { sendLoginOtpRequest, verifyEmailOtpRequest } from '../../../services/authApi';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';
import Logo from '../../../assets/Logo (3).png';

const CoachLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Login States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const { login } = useAuth();

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
      const nextInput = document.getElementById(`coach-login-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`coach-login-otp-${index - 1}`);
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
      const firstInput = document.getElementById('coach-login-otp-0');
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
      if (data.user?.role !== 'COACH') {
        setOtpError('This account is not registered as a coach.');
        return;
      }
      login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      navigate('/coach');
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    setEmailError('');

    if (isApiConfigured()) {
      try {
        await sendLoginOtpRequest(email.trim().toLowerCase());
        setIsOtpSent(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        setSubmitError(err.message || 'Failed to send OTP code');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mock Mode
    setTimeout(() => {
      setIsLoading(false);
      login({
        role: 'COACH',
        name: 'Coach Vikram Singh',
        email,
      });
      navigate('/coach');
    }, 1200);
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
                <ArrowBack sx={{ fontSize: 16 }} /> Edit Email
              </button>

              <div className="w-16 h-16 bg-[#CE2029]/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Email className="text-[#CE2029] text-3xl" />
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
                      id={`coach-login-otp-${index}`}
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
                  className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#36454F] transition-all disabled:opacity-60 shadow-2xl shadow-[#CE2029]/20"
                >
                  {verifying ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> VERIFYING...</>
                  ) : (
                    'VERIFY & ENTER PORTAL'
                  )}
                </motion.button>
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
                <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Coach Terminals</h1>
                <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Authentication required for dashboard access</p>
              </div>

              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                {submitError && (
                  <p className="text-xs text-red-600 font-semibold text-center">{submitError}</p>
                )}
                <TextField
                  fullWidth
                  size="small"
                  label="Staff Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-slate-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                    '& .MuiFormHelperText-root': { fontWeight: '700', fontSize: '10px' }
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  className="bg-[#CE2029] hover:bg-[#36454F] py-4 shadow-2xl shadow-[#CE2029]/20 active:scale-95 transition-all"
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
                  {isLoading ? 'SENDING OTP...' : 'GET OTP CODE'}
                </Button>
              </form>

              <div className="text-center space-y-3 pt-3 border-t border-slate-50">
                 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                   New to coaching? {' '}
                   <button onClick={() => navigate('/coach/signup')} className="text-[#CE2029] font-black underline underline-offset-4">Join Panel</button>
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

export default CoachLogin;
