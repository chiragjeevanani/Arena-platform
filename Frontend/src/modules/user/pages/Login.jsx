import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import loginVideo from '../../../assets/lotties/Kids Playing Badminton.mp4';

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
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#eb483f]/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#eb483f]/10 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full md:max-w-[440px] bg-transparent md:bg-white md:p-10 md:rounded-none rounded-[40px] md:shadow-[0_20px_60px_rgba(235,72,63,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-8">
        <div className="text-center">
          <div className="w-full max-w-[200px] aspect-square mx-auto rounded-[32px] overflow-hidden shadow-2xl shadow-[#eb483f]/15 mb-4 bg-white/50 border border-white/40 backdrop-blur-md">
            <video 
              src={loginVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="mt-6 text-3xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Login to book your favorite court</p>
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
                setEmailError('Please enter a valid email address (e.g., name@example.com)');
              }
            }}
            error={!!emailError}
            helperText={emailError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email className="text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2, 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '14px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                '&.Mui-focused fieldset': { borderColor: '#eb483f', borderWidth: '2px' },
                '&.Mui-error fieldset': { borderColor: '#d32f2f' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#eb483f' },
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
                  <Lock className="text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small" className="hover:text-[#eb483f]/80">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mt: 2, 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '14px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                '&.Mui-focused fieldset': { borderColor: '#eb483f', borderWidth: '2px' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#eb483f' }
            }}
          />

          <div className="text-right">
            <button type="button" className="text-[#eb483f] font-bold text-sm tracking-wide hover:underline transition-all">Forgot Password?</button>
          </div>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            className="bg-[#eb483f] hover:bg-[#eb483f]/90 py-3.5 shadow-xl shadow-[#eb483f]/30 active:scale-95 transition-all"
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              backgroundColor: '#eb483f'
            }}
          >
            Login
          </Button>
        </form>

        <div className="text-center">
          <p className="text-slate-500">
            Don't have an account? {' '}
            <Link to="/signup" className="text-[#eb483f] font-bold underline">Sign Up</Link>
          </p>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default Login;


