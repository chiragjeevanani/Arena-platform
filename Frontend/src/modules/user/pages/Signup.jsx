import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Person, Email, Lock, Phone, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { Gift, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { registerRequest, verifyEmailOtpRequest, resendVerificationRequest } from '../../../services/authApi';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // OTP Verification States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const { login } = useAuth();

  useEffect(() => {
    let interval = null;
    if (isRegistered && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRegistered, resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`signup-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`signup-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        // Clear previous input when jumping back
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
      await resendVerificationRequest(email.trim().toLowerCase());
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('signup-otp-0');
      if (firstInput) firstInput.focus();
    } catch (err) {
      setOtpError(err.message || 'Failed to resend verification OTP');
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
      // Auto login
      login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      navigate('/');
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
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
      if (!name.trim()) {
        setSubmitError('Full name is required');
        return;
      }
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      setPasswordError('');
      setLoading(true);
      try {
        await registerRequest({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
          referralCode: referralCode.trim(),
        });
        setIsRegistered(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        setSubmitError(err.message || 'Sign up failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    }
    if (phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    setPhoneError('');
    navigate('/otp-verify');
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
        className="relative z-10 w-full md:max-w-[400px] bg-transparent md:bg-white md:p-8 md:rounded-3xl rounded-[40px] md:shadow-[0_20px_60px_rgba(206, 32, 41,0.08)] md:border md:border-slate-100"
      >
        {isRegistered ? (
          <div className="text-center py-6 space-y-6">
            <button 
              onClick={() => setIsRegistered(false)}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowBack sx={{ fontSize: 16 }} /> Edit Info
            </button>

            <div className="w-16 h-16 bg-[#CE2029]/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Email className="text-[#CE2029] text-3xl" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Verify Your Email</h1>
              <p className="text-slate-500 text-xs font-medium px-2 leading-relaxed">
                We've sent a 6-digit OTP code to <br />
                <span className="text-[#0F172A] font-bold">{email}</span>. Please enter it below.
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
                    id={`signup-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-14 bg-white/70 border-2 border-slate-100 backdrop-blur-md rounded-xl text-center text-2xl font-black text-[#0F172A] shadow-inner focus:border-[#CE2029] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CE2029]/5 transition-all outline-none"
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

              <div className="space-y-3 pt-2">
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={verifying}
                  className="bg-[#CE2029] hover:bg-[#CE2029]/90 py-3.5 shadow-xl shadow-[#CE2029]/30 active:scale-95 transition-all"
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.02em',
                    backgroundColor: '#CE2029',
                  }}
                >
                  {verifying ? 'Verifying...' : 'Verify & Enter UI'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: 'rgba(0,0,0,0.1)',
                    color: '#0F172A',
                    '&:hover': { borderColor: '#CE2029', color: '#CE2029', backgroundColor: 'transparent' }
                  }}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-full max-w-[140px] aspect-square mx-auto mb-2 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
                <Lottie 
                  animationData={badmintonLottie} 
                  loop={true} 
                  className="w-full h-full"
                />
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Create Account</h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">Start your badminton journey today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <p className="text-xs text-red-600 font-semibold text-center">{submitError}</p>
              )}
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (submitError) setSubmitError('');
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': { paddingY: '8px' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  variant="outlined"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                    if (phoneError) setPhoneError('');
                  }}
                  onBlur={() => {
                    if (phone && phone.length !== 10) {
                      setPhoneError('Phone number must be exactly 10 digits');
                    }
                  }}
                  error={!!phoneError}
                  helperText={phoneError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '&.Mui-error fieldset': { borderColor: '#d32f2f' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': { paddingY: '8px' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                    '& .MuiFormHelperText-root': { marginLeft: '4px', fontWeight: '500' }
                  }}
                />

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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '&.Mui-error fieldset': { borderColor: '#d32f2f' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': { paddingY: '8px' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                    '& .MuiFormHelperText-root': { marginLeft: '4px', fontWeight: '500' }
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Create Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  error={!!passwordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '&.Mui-error fieldset': { borderColor: '#d32f2f' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': { paddingY: '8px' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                    '& .MuiFormHelperText-root': { marginLeft: '4px', fontWeight: '500' }
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '&.Mui-error fieldset': { borderColor: '#d32f2f' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': { paddingY: '8px' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                    '& .MuiFormHelperText-root': { marginLeft: '4px', fontWeight: '500' }
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Referral Code (Optional)"
                  variant="outlined"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Gift size={18} className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                    },
                    '& .MuiOutlinedInput-input': { paddingY: '8px' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
                  }}
                />
              </div>

              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: '#CE2029', '&.Mui-checked': { color: '#CE2029' }, py: 0.5 }} />}
                label={<span className="text-xs text-slate-600 font-medium whitespace-nowrap">I agree to the Terms & Conditions</span>}
                sx={{ mt: -1 }}
              />

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
                {loading ? 'Creating account…' : 'Sign Up'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Already have an account? {' '}
                <Link to="/login" className="text-[#CE2029] font-bold underline hover:text-[#CE2029]/80 transition-colors">Login</Link>
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;


