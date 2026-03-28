import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { ShuttlecockIcon } from '../../user/components/BadmintonIcons';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      login({ 
        role: formData.role,
        assignedArena: formData.role === 'ARENA_ADMIN' ? 'arena-1' : 'all' 
      });
      // Role-specific navigation
      if (formData.role === 'ARENA_ADMIN') {
        navigate('/arena');
      } else {
        navigate('/admin');
      }
    }, 1200);
  };

  const roles = [
    { id: 'ARENA_ADMIN', label: 'Arena Manager', desc: 'Regional' },
    { id: 'SUPER_ADMIN', label: 'Admin', desc: 'Central' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7F6] font-sans relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#eb483f]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1a2b3c]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[850px] bg-white rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10"
      >
        {/* Left Section: Branding & Visuals */}
        <div className="hidden lg:flex flex-col flex-1 bg-[#1a2b3c] p-10 relative overflow-hidden text-white">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-[#eb483f] flex items-center justify-center shadow-lg shadow-[#eb483f]/20">
                <ShuttlecockIcon size={24} className="text-white" />
              </div>
              <span className="font-black font-display tracking-tight text-xl uppercase">Arena<span className="text-[#eb483f]">Central</span></span>
            </div>

            <div className="space-y-4 mt-6">
              <h1 className="text-4xl font-black font-display leading-tight tracking-tight">
                Empowering <br />
                <span className="text-[#eb483f]">Modern Sports</span> <br />
                Infrastructure.
              </h1>
              <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-[280px]">
                The authoritative command center for stadium operations and athlete management.
              </p>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-6 relative z-10">
            {[
              { icon: CheckCircle2, text: 'Neural Analytics' },
              { icon: CheckCircle2, text: 'POS Integration' },
              { icon: CheckCircle2, text: 'Asset Tracking' },
              { icon: CheckCircle2, text: 'Cloud Security' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <f.icon size={16} className="text-[#eb483f]" strokeWidth={3} /> {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="w-full lg:w-[360px] p-8 lg:p-10 flex flex-col justify-center bg-white border-l border-slate-50">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-black font-display text-[#1a2b3c] tracking-tight">Staff Authentication</h2>
            <p className="text-xs font-bold text-slate-400 mt-1.5">Initialize your administrative session terminal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Role Selection */}
              <div className="flex p-1 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    className={`flex-1 py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.role === r.id 
                        ? 'bg-[#eb483f] text-white shadow-lg' 
                        : 'text-slate-400 hover:text-[#1a2b3c]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="group relative">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1 transition-colors group-focus-within:text-[#eb483f]">Access Identifier</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-all" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="Enter official email"
                    className="w-full py-3.5 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-[#1a2b3c] outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner focus:shadow-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1 transition-colors group-focus-within:text-[#eb483f]">Passkey Token</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-all" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter passkey"
                    className="w-full py-3.5 pl-10 pr-12 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-[#1a2b3c] outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner focus:shadow-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#eb483f] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#eb483f] focus:ring-[#eb483f]" />
                  <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-[#1a2b3c] transition-colors tracking-widest">Persist Session</span>
              </label>
              <button type="button" className="text-[11px] font-black text-[#eb483f] uppercase tracking-widest hover:underline">Revoke Access?</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-2xl bg-[#eb483f] text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-[#eb483f]/20 hover:shadow-[#eb483f]/40 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Establish Session <ArrowRight size={18} strokeWidth={3} /></>
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-[11px] font-black uppercase tracking-widest shadow-sm"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <div className="mt-8 text-center border-t border-slate-50 pt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-200 flex items-center justify-center gap-2">
              <Shield size={12} strokeWidth={2.5} /> Military-Grade Session Guard
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
