import { useNavigate } from 'react-router-dom';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const isDark = false;

  const menuItems = [
    { icon: User, label: 'Edit Profile', color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', path: '/profile/edit' },
    { icon: History, label: 'Booking History', color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', path: '/bookings' },
    { icon: Wallet, label: 'My Wallet', color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', path: '/profile/wallet' },
    { icon: Bell, label: 'Notifications', color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', path: '/profile/notifications' },
    { icon: Shield, label: 'Privacy & Security', color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', path: '/profile/privacy' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', path: '/profile/help' },
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” DESKTOP VIEW â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <div className="hidden md:block max-w-6xl mx-auto md:pt-10 md:px-8 relative z-20">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              'bg-white border-slate-200 text-[#0F172A] shadow-sm'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-2xl font-black font-display tracking-tight ${'text-[#0F172A]'}`}>My Profile</h1>
        </div>

        <div className="grid grid-cols-[380px_1fr] gap-10 items-start">
          {/* LEFT COLUMN: Sidebar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-10 rounded-3xl border sticky top-10 backdrop-blur-xl transition-all duration-500 ${
              isDark 
                ? 'bg-white/[0.03] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]' 
                : 'bg-white/80 border-white shadow-[0_8px_32px_rgba(31,38,135,0.07)]'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-[3px] p-1 transition-all duration-500 ${
                  'border-blue-50 bg-slate-50'
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
                    'bg-[#0F172A] text-white border-white'
                  }`}
                >
                  <Pencil size={14} strokeWidth={3} />
                </button>
              </div>

              <div className="text-center mt-6">
                <h2 className={`text-2xl font-black tracking-tight font-display ${'text-[#0F172A]'}`}>Muhammad Haroos</h2>
                <p className={`text-[12px] font-medium mt-1 ${'text-slate-400'}`}>haroos@arenahub.com</p>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-4 border ${
                  'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-[#eb483f] animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Premium Member</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full mt-10 pt-10 border-t border-dashed border-slate-200/50">
                <div className="text-center">
                  <p className={`text-2xl font-black font-display ${'text-[#0F172A]'}`}>12</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${'text-slate-400'}`}>Bookings</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-black font-display ${'text-[#0F172A]'}`}>â‚¹4.8k</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${'text-slate-400'}`}>Spent</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Content Groups */}
          <div className="space-y-12 pb-20">
            {/* My Information Group */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${'text-slate-400'}`}>My Information</h3>
              <div className="space-y-1">
                {[
                  { icon: History, label: 'Booking History', sub: 'Track and manage your arena slots', path: '/bookings', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Wallet, label: 'My Wallet', sub: 'Check balance and payment history', path: '/profile/wallet', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Shield, label: 'Privacy & Security', sub: 'Manage your security preferences', path: '/profile/privacy', color: 'text-purple-500', bg: 'bg-purple-50' },
                  { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs and direct customer support', path: '/profile/help', color: 'text-amber-500', bg: 'bg-amber-50' }
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 10, scale: 1.01 }}
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center gap-5 p-5 transition-all text-left border rounded-2xl mb-4 last:mb-0 backdrop-blur-sm ${
                      isDark 
                        ? 'bg-white/[0.02] border-white/10 hover:border-[#eb483f]/30 hover:bg-white/[0.04] shadow-lg shadow-black/10' 
                        : 'bg-white/50 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-md shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isDark ? 'bg-white/5 text-white/40 group-hover:bg-[#eb483f]/10 group-hover:text-[#eb483f]' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <item.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-[15px] ${'text-[#0F172A]'}`}>{item.label}</h4>
                      <p className={`text-[11px] mt-0.5 ${'text-slate-400'}`}>{item.sub}</p>
                    </div>
                    <ChevronRight size={18} className={`transition-all ${isDark ? 'text-white/10 group-hover:text-white/40' : 'text-slate-200 group-hover:text-slate-400'}`} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* App Preferences Group */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${'text-slate-400'}`}>App Preferences</h3>
              <div className="space-y-1">
                {[
                  { icon: Bell, label: 'Notifications', sub: 'Manage alerts and updates', path: '/profile/notifications', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Settings, label: 'Settings', sub: 'General app settings', path: '/profile/edit', color: 'text-slate-500', bg: 'bg-slate-50' }
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 10, scale: 1.01 }}
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center gap-5 p-5 transition-all text-left border rounded-2xl mb-4 last:mb-0 backdrop-blur-sm ${
                      isDark 
                        ? 'bg-white/[0.02] border-white/10 hover:border-[#eb483f]/30 hover:bg-white/[0.04] shadow-lg shadow-black/10' 
                        : 'bg-white/50 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-md shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isDark ? 'bg-white/5 text-white/40 group-hover:bg-[#eb483f]/10 group-hover:text-[#eb483f]' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <item.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-[15px] ${'text-[#0F172A]'}`}>{item.label}</h4>
                      <p className={`text-[11px] mt-0.5 ${'text-slate-400'}`}>{item.sub}</p>
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
              className={`w-full p-4 rounded-2xl flex items-center transition-all border group backdrop-blur-md ${
                isDark 
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' 
                  : 'bg-red-50/50 border-red-100 hover:bg-red-50 hover:shadow-sm'
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

      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” MOBILE VIEW â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <div className="md:hidden">
        {/* Settings Button - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border backdrop-blur-md transition-all ${
              'bg-white/20 border-white/30 text-white shadow-xl'
            }`}
          >
            <Settings size={20} />
          </motion.button>
        </div>

        {/* Profile Header - Compact Flat Version */}
        <div className={`relative pt-6 pb-4 md:pt-8 md:pb-6 overflow-hidden transition-all duration-700 bg-[#eb483f]`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center relative z-10 px-6 md:px-8">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-[2px] p-0.5 shadow-2xl transition-all duration-500 border-white/30 bg-white/20`}
              >
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                  alt="User"
                  className="w-full h-full object-cover rounded-xl"
                />
              </motion.div>
              <button 
                onClick={() => navigate('/profile/edit')}
                className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-[2px] flex items-center justify-center active:scale-90 transition-all shadow-xl bg-[#fffdd0] text-[#eb483f] border-white`}
              >
                <Pencil size={12} strokeWidth={3} />
              </button>
            </div>

            <div className="text-center mt-4 md:mt-6">
              <h2 className="text-xl md:text-2xl font-black tracking-tight font-display text-white">Muhammad Haroos</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-2 border bg-white/20 border-white/20 text-[#fffdd0]`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#fffdd0] animate-pulse" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">Premium Member</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-4 md:mt-6 w-full max-w-[320px] mx-auto gap-8 md:gap-12 border-t border-white/20 pt-4 px-4">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-black font-display text-white leading-none">12</p>
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mt-1.5">Bookings</p>
            </div>
            <div className="text-center px-4 md:px-8 border-x border-white/10">
              <p className="text-xl md:text-2xl font-black font-display text-white leading-none">â‚¹4.8k</p>
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mt-1.5">Spent</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-black font-display text-white leading-none">4.9</p>
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1">Level <Star size={8} className="text-[#FFD600] fill-[#FFD600]" /></p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 md:py-10 grid grid-cols-1 gap-3 md:gap-5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full p-3.5 md:p-4 rounded-2xl md:rounded-[24px] flex items-center transition-all border relative overflow-hidden backdrop-blur-xl ${
                  isDark 
                    ? 'bg-white/[0.03] border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.1)]' 
                    : 'bg-white/70 border-white shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mr-4`}>
                  <Icon size={16} className="md:w-5 md:h-5" />
                </div>
                <span className={`flex-1 text-left font-bold text-[13px] ${'text-[#0F172A]'}`}>{item.label}</span>
                <ChevronRight size={12} className="opacity-30" />
              </motion.button>
            );
          })}
          <button 
            onClick={() => navigate('/login')} 
            className={`w-full p-3.5 md:p-4 rounded-2xl md:rounded-[24px] flex items-center mt-2 md:mt-4 border backdrop-blur-md transition-all ${
              isDark 
                ? 'border-red-500/20 bg-red-500/5' 
                : 'border-red-100 bg-red-50/50 shadow-[0_4px_24px_rgba(239,68,68,0.05)]'
            }`}
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mr-4">
              <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
            <span className="flex-1 text-left font-black text-red-500 text-[12px] tracking-widest uppercase text-center pr-10">Logout Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;



