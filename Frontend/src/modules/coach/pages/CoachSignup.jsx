import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, MenuItem } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person, Category } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { coachRegisterRequest, loginRequest } from '../../../services/authApi';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const CoachSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: 'Badminton',
    password: ''
  });
  const [submitError, setSubmitError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsLoading(true);
    try {
      if (isApiConfigured()) {
        if (!formData.password || formData.password.length < 8) {
          setSubmitError('Password must be at least 8 characters');
          return;
        }
        await coachRegisterRequest({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          name: formData.name.trim(),
        });
        const data = await loginRequest(formData.email.trim().toLowerCase(), formData.password);
        login({ token: data.token, refreshToken: data.refreshToken, user: data.user });
        navigate('/coach');
        return;
      }
      await new Promise((r) => setTimeout(r, 600));
      login({
        role: 'COACH',
        name: formData.name,
        email: formData.email,
      });
      navigate('/coach');
    } catch (err) {
      setSubmitError(err.message || 'Could not create coach account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#CE2029]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#243B53]/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full md:max-w-[420px] bg-transparent md:bg-white md:p-10 md:rounded-[2.5rem] rounded-[40px] md:shadow-[0_40px_100px_rgba(15,23,42,0.08)] md:border md:border-slate-100 my-8"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CE2029]/10 border border-[#CE2029]/20 mb-2">
               <span className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest">Panel Application</span>
            </div>

            <div className="w-full max-w-[120px] aspect-square mx-auto mb-1 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
              <Lottie 
                animationData={badmintonLottie} 
                loop={true} 
                className="w-full h-full"
              />
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Become a Coach</h1>
            <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Join our network of elite sports professionals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-1">
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              variant="outlined"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2.5, // Added margin bottom
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Professional Email"
              variant="outlined"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2.5, // Added margin bottom
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
              }}
            />

            <TextField
              fullWidth
              select
              size="small"
              label="Coaching Specialty"
              variant="outlined"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              sx={{ 
                mb: 2.5, // Added margin bottom
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
              }}
            >
              <MenuItem value="Badminton">Badminton</MenuItem>
              <MenuItem value="Tennis">Tennis</MenuItem>
              <MenuItem value="Table Tennis">Table Tennis</MenuItem>
              <MenuItem value="Squash">Squash</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Secure Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                mb: 1, // Slight margin
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '16px',
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  '&.Mui-focused fieldset': { borderColor: '#CE2029', borderWidth: '2px' },
                  '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' }
              }}
            />

            {submitError && (
              <p className="text-center text-xs text-red-600 font-semibold mt-2">{submitError}</p>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              className="bg-[#CE2029] hover:bg-[#36454F] py-4 mt-4 shadow-2xl shadow-[#CE2029]/20 active:scale-95 transition-all"
              sx={{
                borderRadius: '18px',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: '900',
                letterSpacing: '0.15em',
                backgroundColor: '#CE2029',
                paddingY: '14px',
                marginTop: '16px'
              }}
            >
              {isLoading ? 'PROCESSING...' : 'APPLY FOR PANEL'}
            </Button>
          </form>

          <div className="text-center space-y-4 pt-4 border-t border-slate-50">
             <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
               Already a coach? {' '}
               <button onClick={() => navigate('/coach/login')} className="text-[#CE2029] font-black underline underline-offset-4">Log In</button>
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

export default CoachSignup;
