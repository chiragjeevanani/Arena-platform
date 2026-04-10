import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Email Validation Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }
    
    setEmailError(''); // Clear error on success

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
        <div className="text-center">
          <div className="w-full max-w-[140px] aspect-square mx-auto mb-2 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
            <Lottie 
              animationData={badmintonLottie} 
              loop={true} 
              className="w-full h-full"
            />
          </div>
          <h1 className="mt-2 text-2xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Welcome Back</h1>
          <p className="text-slate-500 mt-1 text-xs font-medium">Login to book your favorite court</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              // Trigger validation when user clicks away from the field
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
                paddingY: '8px', // More compact height
              },
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock className="text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                    {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': { 
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
              },
              '& .MuiOutlinedInput-input': {
                paddingY: '8px', // More compact height
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
            }}
          />

          <div className="text-right">
            <button type="button" className="text-[#CE2029] font-bold text-xs tracking-wide hover:underline transition-all">Forgot Password?</button>
          </div>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
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
            Login
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


