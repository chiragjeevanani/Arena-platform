import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, MenuItem } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person, Category, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { coachRegisterRequest, loginRequest, verifyEmailOtpRequest, resendVerificationRequest } from '../../../services/authApi';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const CoachSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: 'Badminton',
  });
  const [submitError, setSubmitError] = useState('');
  
  // OTP Verification States
  const [isRegistered, setIsRegistered] = useState(false);
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
      const nextInput = document.getElementById(`coach-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`coach-otp-${index - 1}`);
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
      await resendVerificationRequest(formData.email.trim().toLowerCase());
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('coach-otp-0');
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
      const data = await verifyEmailOtpRequest(formData.email.trim().toLowerCase(), code);
      // Auto login
      login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      navigate('/coach');
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsLoading(true);
    try {
      if (isApiConfigured()) {
        await coachRegisterRequest({
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
        });
        setIsRegistered(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        return;
      }
      await new Promise((r) => setTimeout(r, 600));
      login({
        role: 'COACH',
        name: formData.name,
        email: formData.email,
      });
      navigate('/coach');
    } catch (err) {
      setSubmitError(err.message || 'Could not create coach account');
    } finally {
      setIsLoading(false);
    }
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
        className="relative z-10 w-full md:max-w-[420px] bg-transparent md:bg-white md:p-10 md:rounded-[2.5rem] rounded-[40px] md:shadow-[0_40px_100px_rgba(15,23,42,0.08)] md:border md:border-slate-100 my-8"
      >
        <div className="space-y-6">
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
                  We've sent a 6-digit OTP code to your professional email <br />
                  <span className="text-[#0F172A] font-bold">{formData.email}</span>. Please enter it below.
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
                      id={`coach-otp-${index}`}
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
                    className="bg-[#CE2029] hover:bg-[#36454F] py-4 shadow-2xl shadow-[#CE2029]/20 active:scale-95 transition-all"
                    sx={{
                      borderRadius: '18px',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '900',
                      letterSpacing: '0.15em',
                      backgroundColor: '#CE2029',
                      paddingY: '14px',
                    }}
                  >
                    {verifying ? 'VERIFYING...' : 'VERIFY & ENTER PANEL'}
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/coach/login')}
                    sx={{
                      borderRadius: '18px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderColor: 'rgba(0,0,0,0.1)',
                      color: '#0F172A',
                      paddingY: '12px',
                      '&:hover': { borderColor: '#CE2029', color: '#CE2029', backgroundColor: 'transparent' }
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CE2029]/10 border border-[#CE2029]/20 mb-2">
                   <span className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest">Panel Application</span>
                </div>

                <div className="w-full max-w-[120px] aspect-square mx-auto mb-1 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
                  <Lottie 
                    animationData={badmintonLottie} 
                    loop={true} 
                    className="w-full h-full"
                  />
                </div>
                <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Become a Coach</h1>
                <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Join our network of elite sports professionals</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-1">
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  variant="outlined"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="text-slate-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2.5, // Added margin bottom
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Professional Email"
                  variant="outlined"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-slate-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2.5, // Added margin bottom
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
                  }}
                />

                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Coaching Specialty"
                  variant="outlined"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  sx={{ 
                    mb: 2.5, // Added margin bottom
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
                  }}
                >
                  <MenuItem value="Badminton">Badminton</MenuItem>
                  <MenuItem value="Tennis">Tennis</MenuItem>
                  <MenuItem value="Table Tennis">Table Tennis</MenuItem>
                  <MenuItem value="Squash">Squash</MenuItem>
                </TextField>



                {submitError && (
                  <p className="text-center text-xs text-red-600 font-semibold mt-2">{submitError}</p>
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  className="bg-[#CE2029] hover:bg-[#36454F] py-4 mt-4 shadow-2xl shadow-[#CE2029]/20 active:scale-95 transition-all"
                  sx={{
                    borderRadius: '18px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    letterSpacing: '0.15em',
                    backgroundColor: '#CE2029',
                    paddingY: '14px',
                    marginTop: '16px'
                  }}
                >
                  {isLoading ? 'PROCESSING...' : 'APPLY FOR PANEL'}
                </Button>
              </form>

              <div className="text-center space-y-4 pt-4 border-t border-slate-50">
                 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                   Already a coach? {' '}
                   <button onClick={() => navigate('/coach/login')} className="text-[#CE2029] font-black underline underline-offset-4">Log In</button>
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

export default CoachSignup;
