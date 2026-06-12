import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { sendLoginOtpRequest, verifyEmailOtpRequest } from '../../../services/authApi';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';
import Logo from '../../../assets/Logo (3).png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Login States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const { login } = useAuth();

  useEffect(() => {
    const st = location.state;
    if (st?.registeredEmail) {
      setEmail(st.registeredEmail);
    }
    if (st?.message) {
      setInfoMessage(st.message);
    }
  }, [location.state]);

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
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
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
      const firstInput = document.getElementById('login-otp-0');
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
      login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      navigate('/');
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    if (isApiConfigured()) {
      setLoading(true);
      try {
        await sendLoginOtpRequest(email.trim().toLowerCase());
        setIsOtpSent(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        setSubmitError(err.message || 'Failed to send OTP code');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock mode
    login();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#CE2029]/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#CE2029]/10 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full md:max-w-[320px] bg-transparent md:bg-white md:p-8 md:rounded-3xl rounded-[40px] md:shadow-[0_20px_60px_rgba(206, 32, 41,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-6">
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
                      id={`login-otp-${index}`}
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
                  className="bg-[#CE2029] hover:bg-[#CE2029]/90 py-3 shadow-xl shadow-[#CE2029]/30 active:scale-95 transition-all"
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.02em',
                    backgroundColor: '#CE2029'
                  }}
                >
                  {verifying ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <img src={Logo} alt="AMM Sports" className="w-20 h-20 object-contain" />
                </div>
                <div className="w-full max-w-[140px] aspect-square mx-auto mb-2 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
                  <Lottie 
                    animationData={badmintonLottie} 
                    loop={true} 
                    className="w-full h-full"
                  />
                </div>
                <h1 className="mt-2 text-2xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Welcome Back</h1>
                <p className="text-slate-500 mt-1 text-xs font-medium">Sign in with email OTP to book courts</p>
              </div>

              <form onSubmit={handleSendOtpSubmit} className="space-y-6">
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  variant="outlined"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (email && !emailRegex.test(email)) {
                      setEmailError('Please enter a valid email address');
                    }
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': {
                      paddingY: '8px',
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                    '& .MuiFormHelperText-root': { marginLeft: '4px', fontWeight: '500' }
                  }}
                />

                {infoMessage && (
                  <p className="text-xs text-emerald-700 font-semibold text-center -mt-2">{infoMessage}</p>
                )}
                {submitError && (
                  <p className="text-xs text-red-600 font-semibold text-center -mt-2">{submitError}</p>
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  className="bg-[#CE2029] hover:bg-[#CE2029]/90 py-3 shadow-xl shadow-[#CE2029]/30 active:scale-95 transition-all"
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.02em',
                    backgroundColor: '#CE2029'
                  }}
                >
                  {loading ? 'Sending OTP…' : 'Get OTP Code'}
                </Button>
              </form>

              <div className="text-center space-y-3 pt-2">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Don't have an account? {' '}
                  <Link to="/signup" className="text-[#CE2029] font-black underline underline-offset-4">Sign Up</Link>
                </p>
                <div className="pt-4 border-t border-slate-50">
                  <Link to="/coach/login" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-[#CE2029] transition-all">
                    Staff & Coach Portal
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
