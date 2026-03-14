import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full md:max-w-[440px] bg-white md:p-10 md:rounded-none rounded-[40px] md:shadow-[0_20px_60px_rgba(235,72,63,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#eb483f] rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-[#eb483f]/20">
            <LoginIcon className="text-white" sx={{ fontSize: 40 }} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Login to book your favorite court</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="text-right">
            <button type="button" className="text-[#eb483f] font-semibold text-sm">Forgot Password?</button>
          </div>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            className="bg-[#eb483f] hover:bg-[#eb483f]/90 py-4 shadow-lg shadow-[#eb483f]/20"
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
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


