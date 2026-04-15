import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Lottie from 'lottie-react';
import Logo from '../../../assets/Logo (3).png';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const ArenaLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/arena');
    }, 1200);
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
        className="relative z-10 w-full md:max-w-[380px] bg-transparent md:bg-white md:p-7 md:rounded-[2rem] rounded-[40px] md:shadow-[0_40px_100px_rgba(15,23,42,0.08)] md:border md:border-slate-100"
      >
        <div className="space-y-5">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-1">
              <img src={Logo} alt="AMM Sports" className="w-14 h-14 object-contain" />
            </div>
            <div className="w-full max-w-[110px] aspect-square mx-auto mb-1 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
              <Lottie 
                animationData={badmintonLottie} 
                loop={true} 
                className="w-full h-full"
              />
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Arena Portal</h1>
            <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Sign in to manage your arena</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="arena@example.com"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#CE2029]/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-12 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#CE2029]/50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-[#CE2029] font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Forgot Password?</button>
            </div>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60 shadow-lg shadow-[#CE2029]/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Enter Portal <ArrowRight size={14} strokeWidth={2.5} /></>
              )}
            </motion.button>
          </form>

          <div className="text-center space-y-3 pt-3 border-t border-slate-50">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Not an arena manager?{' '}
              <button onClick={() => navigate('/admin/login')} className="text-[#CE2029] font-black underline underline-offset-4">Admin Login</button>
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

export default ArenaLogin;
