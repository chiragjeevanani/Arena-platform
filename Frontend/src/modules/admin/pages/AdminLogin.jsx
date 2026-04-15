import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import Lottie from 'lottie-react';
import { useAuth } from '../../user/context/AuthContext';
import Logo from '../../../assets/Logo (3).png';
import badmintonLottie from '../../../assets/lotties/Badminton_Player_Character3.json';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const FIXED_CREDENTIALS = {
    SUPER_ADMIN: { email: 'superadmin@arena.com', password: 'password123' },
    ARENA_ADMIN: { email: 'manager@elitehub.com', password: 'password123' }
  };

  const [formData, setFormData] = useState({
    email: FIXED_CREDENTIALS.ARENA_ADMIN.email,
    password: FIXED_CREDENTIALS.ARENA_ADMIN.password,
    role: 'ARENA_ADMIN' 
  });

  const handleRoleChange = (roleId) => {
    setFormData({
      role: roleId,
      email: FIXED_CREDENTIALS[roleId].email,
      password: FIXED_CREDENTIALS[roleId].password
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      login({ 
        role: formData.role,
        assignedArena: formData.role === 'ARENA_ADMIN' ? 'arena-1' : 'all' 
      });
      if (formData.role === 'ARENA_ADMIN') {
        navigate('/arena');
      } else {
        navigate('/admin');
      }
    }, 1200);
  };

  const roles = [
    { id: 'ARENA_ADMIN', label: 'Arena Manager' },
    { id: 'SUPER_ADMIN', label: 'System Admin' },
  ];

  const inputCls = "w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[#CE2029]/50";

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#CE2029]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#36454F]/5 rounded-full blur-[100px]" />

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
              <img src={Logo} alt="AMM Sports" className="w-28 h-28 object-contain" />
            </div>
            <div className="w-full max-w-[110px] aspect-square mx-auto mb-1 overflow-hidden pointer-events-none mix-blend-multiply bg-transparent">
              <Lottie 
                animationData={badmintonLottie} 
                loop={true} 
                className="w-full h-full"
              />
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#0F172A] tracking-tight">Admin Terminal</h1>
            <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-wider">Initialize secure administrative session</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Access Identifier</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Passkey Token</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={inputCls + " pr-12"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60 shadow-lg shadow-[#CE2029]/20 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Login <ArrowRight size={14} strokeWidth={2.5} /></>
              )}
            </motion.button>
          </form>

          <div className="text-center pt-3 border-t border-slate-50">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center justify-center gap-2">
              <Shield size={12} strokeWidth={2.5} className="text-[#CE2029]" /> 
              Secure Access Node · AMM Sports © 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
