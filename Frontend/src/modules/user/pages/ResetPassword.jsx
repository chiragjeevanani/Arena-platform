import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { isApiConfigured } from '../../../services/config';
import { resetPasswordRequest } from '../../../services/authApi';
import Logo from '../../../assets/Logo (3).png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isApiConfigured()) {
      setSubmitError('API is not configured. Set VITE_API_BASE_URL to reset your password.');
      return;
    }
    const t = (searchParams.get('token') || token).trim();
    if (!t) {
      setSubmitError('Reset token is required (open the link from your email).');
      return;
    }
    if (!password || password.length < 8) {
      setSubmitError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setSubmitError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest(t, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true, state: { message: 'Password updated. Please sign in.' } }), 1200);
    } catch (err) {
      setSubmitError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#CE2029]/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#CE2029]/10 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full md:max-w-[360px] bg-transparent md:bg-white md:p-8 md:rounded-3xl rounded-[40px] md:shadow-[0_20px_60px_rgba(206,32,41,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <img src={Logo} alt="AMM Sports" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>
              New password
            </h1>
            <p className="text-slate-500 mt-1 text-xs font-medium">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!tokenFromUrl && (
              <TextField
                fullWidth
                size="small"
                label="Reset token"
                variant="outlined"
                value={token}
                onChange={(ev) => setToken(ev.target.value)}
                helperText="Paste the token from your reset email if the link did not include it."
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
                }}
              />
            )}

            <TextField
              fullWidth
              size="small"
              label="New password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value);
                if (submitError) setSubmitError('');
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="text-slate-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={confirm}
              onChange={(ev) => {
                setConfirm(ev.target.value);
                if (submitError) setSubmitError('');
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
              }}
            />

            {submitError && (
              <p className="text-xs text-red-600 font-semibold text-center">{submitError}</p>
            )}
            {done && (
              <p className="text-xs text-emerald-700 font-semibold text-center">Password updated. Redirecting…</p>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || done}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 'bold',
                backgroundColor: '#CE2029',
                py: 1.25,
              }}
            >
              {loading ? 'Saving…' : 'Update password'}
            </Button>
          </form>

          <p className="text-center text-[11px] text-slate-500 font-bold">
            <Link to="/login" className="text-[#CE2029] font-black underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
