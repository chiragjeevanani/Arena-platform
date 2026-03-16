import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Person, Email, Lock, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';


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
      setEmailError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }
    
    setEmailError(''); // Clear error on success
    setPhoneError('');
    navigate('/otp-verify');
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
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Create Account</h1>
            <p className="text-slate-500 mt-2 font-medium">Start your badminton journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className="text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2, 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(10px)',
                  '&.Mui-focused fieldset': { borderColor: '#eb483f', borderWidth: '2px' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#eb483f' }
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
                    <Phone className="text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
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

            <FormControlLabel
              control={<Checkbox color="primary" sx={{ color: '#eb483f', '&.Mui-checked': { color: '#eb483f' } }} />}
              label={<span className="text-sm text-slate-600 font-medium">I agree to the Terms & Conditions</span>}
            />

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
              Sign Up
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-500">
              Already have an account? {' '}
              <Link to="/login" className="text-[#eb483f] font-bold underline hover:text-[#eb483f]/80 transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;


