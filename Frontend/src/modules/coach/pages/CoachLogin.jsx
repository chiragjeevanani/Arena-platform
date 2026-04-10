import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../../user/context/AuthContext';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const CoachLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('coach@ammarena.com');
  const [password, setPassword] = useState('password123');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Email Validation Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      setIsLoading(false);
      return;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    setEmailError('');

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      login({ 
        role: 'COACH',
        name: 'Coach Vikram Singh',
        email: email
      });
      navigate('/coach');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Decor - Same as User Login but subtle variant */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#CE2029]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#243B53]/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full md:max-w-[400px] bg-transparent md:bg-white md:p-10 md:rounded-[2.5rem] rounded-[40px] md:shadow-[0_40px_100px_rgba(15,23,42,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-8">
          <div className="text-center">
            {/* Coach Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CE2029]/10 border border-[#CE2029]/20 mb-4">
               <span className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest">Official Coach Entry</span>
            </div>

            <div className="w-full max-w-[160px] aspect-square mx-auto mb-2 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
              <Lottie 
                animationData={badmintonLottie} 
                loop={true} 
                className="w-full h-full"
              />
            </div>
            <h1 className="mt-2 text-3xl font-black text-[#0F172A] tracking-tight">Coach Terminals</h1>
            <p className="text-slate-500 mt-2 text-[11px] font-bold uppercase tracking-wider">Authentication required for dashboard access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              size="small"
              label="Staff Email"
              variant="outlined"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3, // Added margin bottom
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                '& .MuiFormHelperText-root': { fontWeight: '700', fontSize: '10px' }
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Secure Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="text-slate-400" />
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
                mt: 1, // Added margin top
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
              }}
            />

            <div className="text-right">
              <button type="button" className="text-[#CE2029] font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Forgot Passkey?</button>
            </div>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              className="bg-[#CE2029] hover:bg-[#36454F] py-4 shadow-2xl shadow-[#CE2029]/20 active:scale-95 transition-all"
              sx={{
                borderRadius: '18px',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: '900',
                letterSpacing: '0.15em',
                backgroundColor: '#CE2029',
                paddingY: '14px'
              }}
            >
              {isLoading ? 'VERIFYING...' : 'ENTER PORTAL'}
            </Button>
          </form>

          <div className="text-center space-y-4 pt-4 border-t border-slate-50">
             <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
               New to coaching? {' '}
               <button onClick={() => navigate('/coach/signup')} className="text-[#CE2029] font-black underline underline-offset-4">Join Panel</button>
             </p>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                AMM Sports Network © 2026 
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoachLogin;
