import { useNavigate } from 'react-router-dom';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const menuItems = [
    { icon: User, label: 'Edit Profile', color: 'text-blue-500', bg: 'bg-blue-500/10', path: '/profile/edit' },
    { icon: History, label: 'Booking History', color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/bookings' },
    { icon: Wallet, label: 'My Wallet', color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/profile/wallet' },
    { icon: Bell, label: 'Notifications', color: 'text-purple-500', bg: 'bg-purple-500/10', path: '/profile/notifications' },
    { icon: Shield, label: 'Privacy & Security', color: 'text-blue-600', bg: 'bg-blue-600/10', path: '/profile/privacy' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-slate-500', bg: 'bg-slate-500/10', path: '/profile/help' },
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${isDark ? 'bg-[#08142B]' : 'bg-[#F8FAFC]'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━ DESKTOP VIEW ━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hidden md:block max-w-6xl mx-auto md:pt-10 md:px-8 relative z-20">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-slate-200 text-[#0F172A] shadow-sm'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>My Profile</h1>
        </div>

        <div className="grid grid-cols-[380px_1fr] gap-10 items-start">
          {/* LEFT COLUMN: Sidebar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-10 rounded-3xl border sticky top-10 ${
              isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-[3px] p-1 transition-all duration-500 ${
                  isDark ? 'border-[#22FF88]/20 bg-white/5' : 'border-blue-50 bg-slate-50'
                }`}>
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <button 
                  onClick={() => navigate('/profile/edit')}
                  className={`absolute bottom-0 right-1 w-10 h-10 rounded-xl border-[2px] flex items-center justify-center active:scale-90 transition-all shadow-xl ${
                    isDark ? 'bg-[#22FF88] text-[#08142B] border-[#08142B]' : 'bg-[#0F172A] text-white border-white'
                  }`}
                >
                  <Pencil size={14} strokeWidth={3} />
                </button>
              </div>

              <div className="text-center mt-6">
                <h2 className={`text-2xl font-black tracking-tight font-display ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Muhammad Haroos</h2>
                <p className={`text-[12px] font-medium mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>haroos@arenahub.com</p>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-4 border ${
                  isDark ? 'bg-[#22FF88]/10 border-[#22FF88]/20 text-[#22FF88]' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-[#22FF88] animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Premium Member</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full mt-10 pt-10 border-t border-dashed border-slate-200/50">
                <div className="text-center">
                  <p className={`text-2xl font-black font-display ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>12</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Bookings</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-black font-display ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>₹4.8k</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Spent</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Content Groups */}
          <div className="space-y-12 pb-20">
            {/* My Information Group */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>My Information</h3>
              <div className="space-y-1">
                {[
                  { icon: History, label: 'Booking History', sub: 'Track and manage your arena slots', path: '/bookings', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Wallet, label: 'My Wallet', sub: 'Check balance and payment history', path: '/profile/wallet', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Shield, label: 'Privacy & Security', sub: 'Manage your security preferences', path: '/profile/privacy', color: 'text-purple-500', bg: 'bg-purple-50' },
                  { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs and direct customer support', path: '/profile/help', color: 'text-amber-500', bg: 'bg-amber-50' }
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 10 }}
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center gap-5 p-5 transition-all text-left border-b last:border-0 ${
                      isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isDark ? 'bg-white/5 text-white/40 group-hover:bg-[#22FF88]/10 group-hover:text-[#22FF88]' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <item.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{item.label}</h4>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{item.sub}</p>
                    </div>
                    <ChevronRight size={18} className={`transition-all ${isDark ? 'text-white/10 group-hover:text-white/40' : 'text-slate-200 group-hover:text-slate-400'}`} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* App Preferences Group */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>App Preferences</h3>
              <div className="space-y-1">
                {[
                  { icon: Bell, label: 'Notifications', sub: 'Manage alerts and updates', path: '/profile/notifications', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Settings, label: 'Settings', sub: 'General app settings', path: '/profile/edit', color: 'text-slate-500', bg: 'bg-slate-50' }
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 10 }}
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center gap-5 p-5 transition-all text-left border-b last:border-0 ${
                      isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isDark ? 'bg-white/5 text-white/40 group-hover:bg-[#22FF88]/10 group-hover:text-[#22FF88]' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <item.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{item.label}</h4>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{item.sub}</p>
                    </div>
                    <ChevronRight size={18} className={`transition-all ${isDark ? 'text-white/10 group-hover:text-white/40' : 'text-slate-200 group-hover:text-slate-400'}`} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate('/login')}
              className={`w-full p-4 rounded-2xl flex items-center transition-all border group ${
                isDark ? 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10' : 'bg-red-50/30 border-red-100 hover:bg-red-50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform">
                <LogOut size={18} />
              </div>
              <span className="font-black text-red-500 text-[12px] uppercase tracking-[0.2em]">Logout Account</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━ MOBILE VIEW ━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="md:hidden">
        {/* Settings Button - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border backdrop-blur-md transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/20 border-white/30 text-white shadow-xl'
            }`}
          >
            <Settings size={20} />
          </motion.button>
        </div>

        {/* Profile Header - Compact Flat Version */}
        <div className={`relative pt-8 pb-6 overflow-hidden transition-all duration-700 ${
          isDark ? 'bg-gradient-to-b from-white/[0.03] to-transparent' : 'bg-gradient-to-br from-[#0F172A] to-[#1E293B]'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#22FF88]/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center relative z-10 px-8">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-[2px] p-0.5 shadow-2xl transition-all duration-500 ${
                  isDark ? 'border-[#22FF88]/20 bg-white/5' : 'border-white/20 bg-white/10'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                  alt="User"
                  className="w-full h-full object-cover rounded-xl"
                />
              </motion.div>
              <button 
                onClick={() => navigate('/profile/edit')}
                className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-[2px] flex items-center justify-center active:scale-90 transition-all shadow-xl bg-[#22FF88] text-[#08142B] border-[#08142B]`}
              >
                <Pencil size={12} strokeWidth={3} />
              </button>
            </div>

            <div className="text-center mt-6">
              <h2 className="text-2xl font-black tracking-tight font-display text-white">Muhammad Haroos</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-2.5 border bg-white/10 border-white/10 text-blue-100`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#22FF88] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Premium Member</span>
              </div>
            </div>

            <div className="flex items-center justify-center mt-6 w-full max-w-[320px] gap-12 border-t border-white/10 pt-4">
              <div className="text-center">
                <p className="text-2xl font-black font-display text-white leading-none">12</p>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1.5">Bookings</p>
              </div>
              <div className="text-center px-8 border-x border-white/5">
                <p className="text-2xl font-black font-display text-white leading-none">₹4.8k</p>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1.5">Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black font-display text-white leading-none">4.9</p>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1">Level <Star size={8} className="text-[#FFD600] fill-[#FFD600]" /></p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 grid grid-cols-1 gap-5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full p-3 rounded-2xl flex items-center transition-all border relative overflow-hidden ${
                  isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mr-4`}>
                  <Icon size={18} />
                </div>
                <span className={`flex-1 text-left font-bold text-[13px] ${isDark ? 'text-white/70' : 'text-[#0F172A]'}`}>{item.label}</span>
                <ChevronRight size={12} className="opacity-30" />
              </motion.button>
            );
          })}
          <button onClick={() => navigate('/login')} className="w-full p-3 rounded-2xl flex items-center mt-4 border border-red-500/10 bg-red-500/5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mr-4">
              <LogOut size={18} />
            </div>
            <span className="flex-1 text-left font-black text-red-500 text-[12px] tracking-widest uppercase text-center pr-10">Logout Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
