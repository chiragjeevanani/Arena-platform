import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Person, Email, Lock, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';


const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Phone Validation Check
    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    } else if (phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    // Email Validation Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError(''); // Clear error on success
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
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Create Account</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Start your badminton journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <TextField
                fullWidth
                size="small"
                label="Full Name"
                variant="outlined"
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
              Sign Up
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Already have an account? {' '}
              <Link to="/login" className="text-[#CE2029] font-bold underline hover:text-[#CE2029]/80 transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;


