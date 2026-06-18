import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { loginRequest } from '../../../services/authApi';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';
import Logo from '../../../assets/Logo (3).png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const testEmail = email.trim();
    if (!testEmail) {
      setEmailError('Email is required');
      setLoading(false);
      return;
    }
    if (!emailRegex.test(testEmail)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!password) {
      setSubmitError('Password is required');
      return;
    }
    setEmailError('');

    if (isApiConfigured()) {
      setLoading(true);
      try {
        const data = await loginRequest(email.trim().toLowerCase(), password);
        login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
        const from = location.state?.from || '/';
        navigate(from, { replace: true, state: location.state });
      } catch (err) {
        setSubmitError(err.message || 'Invalid email or password');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock mode
    login();
    const from = location.state?.from || '/';
    navigate(from, { replace: true, state: location.state });
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
            <p className="text-slate-500 mt-1 text-xs font-medium">Sign in to book courts</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
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
                if (email && !emailRegex.test(email.trim())) {
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
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (submitError) setSubmitError('');
              }}
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
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                },
                '& .MuiOutlinedInput-input': { paddingY: '8px' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
              }}
            />

            <div className="flex justify-end mt-1 mb-3">
              <Link to="/forgot-password" className="text-xs font-bold text-[#CE2029] hover:underline">
                Forgot Password?
              </Link>
            </div>

            {infoMessage && (
              <p className="text-xs text-emerald-700 font-semibold text-center">{infoMessage}</p>
            )}
            {submitError && (
              <p className="text-xs text-red-600 font-semibold text-center">{submitError}</p>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              className="bg-[#CE2029] hover:bg-[#CE2029]/90 py-3 shadow-xl shadow-[#CE2029]/30 active:scale-95 transition-all mt-2"
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                letterSpacing: '0.02em',
                backgroundColor: '#CE2029'
              }}
            >
              {loading ? 'Logging in…' : 'Login'}
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
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
