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
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
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
            control={<Checkbox color="primary" sx={{ color: '#03396c', '&.Mui-checked': { color: '#03396c' } }} />}
            label={<span className="text-sm text-slate-600 font-medium">I agree to the Terms & Conditions</span>}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            className="bg-[#03396c] hover:bg-[#022c54] py-4 shadow-lg shadow-blue-100"
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#03396c'
            }}
          >
            Sign Up
          </Button>
        </form>

        <div className="text-center">
          <p className="text-slate-500">
            Already have an account? {' '}
            <Link to="/login" className="text-[#03396c] font-bold underline">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
