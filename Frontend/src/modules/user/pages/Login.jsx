import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white px-6 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-[#03396c] rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-100">
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
            <button type="button" className="text-[#03396c] font-semibold text-sm">Forgot Password?</button>
          </div>

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
            Login
          </Button>
        </form>

        <div className="text-center">
          <p className="text-slate-500">
            Don't have an account? {' '}
            <Link to="/signup" className="text-[#03396c] font-bold underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
