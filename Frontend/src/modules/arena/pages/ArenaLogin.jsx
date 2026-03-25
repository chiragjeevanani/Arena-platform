import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Logo from '../../../assets/Logo (3).png';

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
    setLoading(true);
    // Simulate auth — replace with real API call
    setTimeout(() => {
      setLoading(false);
      navigate('/arena');
    }, 1200);
  };

  const inputCls = `w-full bg-white/[0.05] border rounded-xl py-3.5 pr-4 text-[13px] font-medium text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/[0.08]`;

  return (
    <div className="min-h-screen bg-[#0d1526] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#eb483f]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-[#131f38] border border-white/[0.07] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/[0.06] text-center">
            <div className="flex items-center justify-center mb-5">
              <img src={Logo} alt="AMM Sports" className="h-12 object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eb483f]/10 border border-[#eb483f]/20 mb-4">
              <Building2 size={13} className="text-[#eb483f]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#eb483f]">Arena Management Panel</span>
            </div>
            <h1 className="text-2xl font-black text-white">Welcome Back</h1>
            <p className="text-[13px] text-white/40 font-medium mt-1">Sign in to manage your arena</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-7 space-y-4">
            {/* Email */}
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#eb483f] transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="arena@example.com"
                  className={`${inputCls} pl-11 border-white/[0.08] focus:border-[#eb483f]/50`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#eb483f] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`${inputCls} pl-11 pr-12 border-white/[0.08] focus:border-[#eb483f]/50`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#eb483f] to-[#ff6b6b] text-white text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <> Sign In <ArrowRight size={16} strokeWidth={3} /> </>
              )}
            </motion.button>

            {/* Back link */}
            <p className="text-center text-[11px] text-white/25 font-medium">
              Not an arena manager?{' '}
              <button type="button" onClick={() => navigate('/admin/login')}
                className="text-[#eb483f] font-bold hover:underline">
                Go to Admin Login
              </button>
            </p>
          </form>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[10px] text-white/20 font-medium mt-5">
          Arena Management System · AMM Sports Platform
        </p>
      </motion.div>
    </div>
  );
};

export default ArenaLogin;
