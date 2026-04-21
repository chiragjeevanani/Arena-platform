import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextField, Button, InputAdornment } from '@mui/material';
import { Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { isApiConfigured } from '../../../services/config';
import { forgotPasswordRequest } from '../../../services/authApi';
import Logo from '../../../assets/Logo (3).png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [doneMessage, setDoneMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setDoneMessage('');
    setDevToken('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    if (!isApiConfigured()) {
      setSubmitError('API is not configured. Set VITE_API_BASE_URL to use password reset.');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPasswordRequest(email.trim().toLowerCase());
      setDoneMessage(
        'If an account exists for that email, you will receive reset instructions shortly.'
      );
      if (data && typeof data.resetToken === 'string' && data.resetToken) {
        setDevToken(data.resetToken);
      }
    } catch (err) {
      setSubmitError(err.message || 'Request failed');
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
              Reset password
            </h1>
            <p className="text-slate-500 mt-1 text-xs font-medium">Enter your account email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              size="small"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CE2029' },
              }}
            />

            {submitError && (
              <p className="text-xs text-red-600 font-semibold text-center">{submitError}</p>
            )}
            {doneMessage && (
              <p className="text-xs text-emerald-700 font-semibold text-center leading-relaxed">{doneMessage}</p>
            )}

            {devToken && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[10px] text-amber-900 font-bold leading-relaxed">
                Dev only: backend returned <code className="font-mono">resetToken</code>. Use it on the reset page
                (never enable <code className="font-mono">PASSWORD_RESET_RETURN_TOKEN</code> in production).
                <div className="mt-2 break-all font-mono text-[9px] opacity-90">{devToken}</div>
              </div>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 'bold',
                backgroundColor: '#CE2029',
                py: 1.25,
              }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
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

export default ForgotPassword;
