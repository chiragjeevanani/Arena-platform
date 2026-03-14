import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { useAuth } from '../../user/context/AuthContext';
import { ShuttlecockIcon } from '../../user/components/BadmintonIcons';

const AdminLogin = () => {
  const { isDark } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const FIXED_CREDENTIALS = {
    SUPER_ADMIN: { email: 'superadmin@arena.com', password: 'password123' },
    ARENA_ADMIN: { email: 'manager@elitehub.com', password: 'password123' },
    RECEPTIONIST: { email: 'reception@arena.com', password: 'password123' }
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
    
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Update AuthContext with the selected role
      login({ 
        role: formData.role,
        assignedArena: formData.role === 'ARENA_ADMIN' ? 'arena-1' : 'all' 
      });

      navigate('/admin');
    }, 1500);
  };

  const roles = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full System Access' },
    { id: 'ARENA_ADMIN', label: 'Arena Admin', desc: 'Manage Single Arena' },
    { id: 'RECEPTIONIST', label: 'Reception', desc: 'POS & Bookings' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 font-sans ${isDark ? 'bg-[#08142B]' : 'bg-[#F0F4F8]'}`}>
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-20 ${isDark ? 'bg-[#22FF88]' : 'bg-[#22FF88]/40'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-20 ${isDark ? 'bg-[#1EE7FF]' : 'bg-[#1EE7FF]/40'}`} />
        <div className="absolute inset-0 court-lines opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-[1100px] min-h-[500px] md:h-[650px] rounded-2xl md:rounded-[2.5rem] border overflow-hidden flex flex-col lg:flex-row shadow-2xl relative z-10 ${
          isDark ? 'bg-[#0A1F44]/80 border-white/10 backdrop-blur-2xl' : 'bg-white/90 border-[#0A1F44]/5 backdrop-blur-xl shadow-blue-900/10'
        }`}
      >
        {/* Left Side: Illustration & Branding */}
        <div className={`hidden lg:flex flex-col flex-1 p-12 relative overflow-hidden ${isDark ? 'bg-[#08142B]/50' : 'bg-[#0A1F44]'}`}>
          <div className="absolute inset-0 court-lines opacity-10" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-2xl bg-[#22FF88]/20 border border-[#22FF88]/30 flex items-center justify-center">
                <ShuttlecockIcon size={24} className="text-[#22FF88]" />
              </div>
              <span className="font-black font-display tracking-tight text-2xl text-white">ARENA<span className="text-[#22FF88]">CRM</span></span>
            </div>

            <div className="space-y-6 mt-20">
              <h1 className="text-5xl font-black font-display text-white leading-tight">
                Unified Management <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22FF88] to-[#1EE7FF]">for Modern Sports.</span>
              </h1>
              <p className="text-white/60 text-lg max-w-md font-medium leading-relaxed">
                Log in to access your customized dashboard, manage bookings, track financials, and scale your arena operations.
              </p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="mt-auto grid grid-cols-2 gap-4 relative z-10">
             {[
               { icon: CheckCircle2, text: 'Real-time Analytics' },
               { icon: CheckCircle2, text: 'Automated Billing' },
               { icon: CheckCircle2, text: 'Advanced RBAC' },
               { icon: CheckCircle2, text: 'Multi-Arena Support' },
             ].map((f, i) => (
               <div key={i} className="flex items-center gap-2 text-white/40 text-sm font-bold uppercase tracking-wider">
                 <f.icon size={16} className="text-[#22FF88]" /> {f.text}
               </div>
             ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-[450px] p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative">
          <div className="mb-6 md:mb-10 text-center lg:text-left">
            <h2 className={`text-2xl md:text-3xl font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Staff Login</h2>
            <p className={`text-[11px] md:text-sm font-medium mt-1 md:mt-2 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Access the management portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection Tabs */}
            <div className={`flex gap-1 p-1 rounded-xl md:rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  className={`flex-1 py-2 md:py-3 px-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.role === r.id 
                      ? 'bg-[#22FF88] text-[#0A1F44] shadow-lg scale-[1.02]' 
                      : `${isDark ? 'text-white/40 hover:text-white' : 'text-[#0A1F44]/40 hover:text-[#0A1F44]'}`
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors md:w-[18px] md:h-[18px] ${isDark ? 'text-white/20 group-focus-within:text-[#22FF88]' : 'text-[#0A1F44]/20 group-focus-within:text-[#22FF88]'}`} size={16} />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all outline-none border ${
                    isDark 
                      ? 'bg-black/20 border-white/5 focus:border-[#22FF88]/50 text-white' 
                      : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44]'
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors md:w-[18px] md:h-[18px] ${isDark ? 'text-white/20 group-focus-within:text-[#22FF88]' : 'text-[#0A1F44]/20 group-focus-within:text-[#22FF88]'}`} size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-10 md:pr-12 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all outline-none border ${
                    isDark 
                      ? 'bg-black/20 border-white/5 focus:border-[#22FF88]/50 text-white' 
                      : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44]'
                  }`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} className="md:w-[18px] md:h-[18px]" /> : <Eye size={16} className="md:w-[18px] md:h-[18px]" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isDark ? 'border-white/20 group-hover:border-[#22FF88]' : 'border-[#0A1F44]/20 group-hover:border-[#22FF88]'}`}>
                   <div className="w-2 h-2 rounded-sm bg-[#22FF88] scale-0 group-hover:scale-100 transition-transform" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-white/40 group-hover:text-white' : 'text-[#0A1F44]/40 group-hover:text-[#0A1F44]'}`}>Remember Me</span>
              </label>
              <button type="button" className="text-xs font-black text-[#22FF88] uppercase tracking-widest hover:underline">Forgot Access?</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#22FF88] text-[#0A1F44] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 shadow-lg md:shadow-xl shadow-[#22FF88]/20 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#1EE7FF] hover:shadow-[#1EE7FF]/30'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#0A1F44]/30 border-t-[#0A1F44] rounded-full animate-spin" />
              ) : (
                <>Sign In Securely <ArrowRight size={14} className="md:w-[16px] md:h-[16px]" /></>
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 flex items-center gap-3 text-[#FF4B4B] text-xs font-bold"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <div className="mt-12 text-center">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-[#0A1F44]/20'}`}>
              <Shield size={12} className="inline mr-2" /> Encrypted RSA-2048 Session
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
