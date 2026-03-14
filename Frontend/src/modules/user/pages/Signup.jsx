import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Person, Email, Lock, Phone, Visibility, VisibilityOff, AppRegistration } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/otp-verify');
  };

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full md:max-w-[440px] bg-white md:p-10 md:rounded-none rounded-[40px] md:shadow-[0_20px_60px_rgba(3,57,108,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-2">Start your badminton journey today</p>
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
                    <Person className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Phone Number"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Email Address"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    <Lock className="text-slate-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
              className="bg-[#eb483f] hover:bg-[#022c54] py-4 shadow-lg shadow-blue-100"
              sx={{
                borderRadius: '16px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#eb483f'
              }}
            >
              Sign Up
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-500">
              Already have an account? {' '}
              <Link to="/login" className="text-[#eb483f] font-bold underline">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;


