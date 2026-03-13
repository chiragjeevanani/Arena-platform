import { useNavigate } from 'react-router-dom';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
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
    <div className={`min-h-screen pb-28 relative overflow-hidden ${isDark ? '' : 'bg-slate-50/50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Settings Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all ${
            isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/80 border-[#0A1F44]/10 text-[#0A1F44]/60 shadow-sm'
          }`}
        >
          <Settings size={20} />
        </motion.button>
      </div>

      {/* Court line background */}
      <div className="absolute inset-0 court-lines opacity-10 pointer-events-none" />


      {/* Profile Header - Compact Flat Version */}
      <div className={`relative pt-8 pb-4 overflow-hidden transition-all duration-500 ${
        isDark ? 'bg-[#08142B]' : 'bg-[#0A1F44]'
      }`}>
        {/* Subtle decorative elements for a premium flat look */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#22FF88]/5 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col items-center relative z-10 px-8">
          {/* Smaller Avatar */}
          <div className="relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-24 h-24 rounded-[32px] overflow-hidden border-2 p-1 transition-all ${
                isDark ? 'border-[#22FF88]/20 bg-white/5' : 'border-[#22FF88]/40 bg-white/10 shadow-xl'
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                alt="User"
                className="w-full h-full object-cover rounded-2xl"
              />
            </motion.div>
            <button 
              onClick={() => navigate('/profile/edit')}
              className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl border-2 flex items-center justify-center active:scale-90 transition-all shadow-lg ${
                isDark ? 'bg-[#22FF88] text-[#08142B] border-[#08142B]' : 'bg-[#22FF88] text-[#08142B] border-white'
              }`}
            >
              <Pencil size={14} strokeWidth={2.5} />
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4"
          >
            <h2 className="text-lg font-black tracking-tight font-display text-white">Muhammad Haroos</h2>
            <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full mt-1.5 border ${
              isDark ? 'bg-[#22FF88]/10 border-[#22FF88]/20 text-[#22FF88]' : 'bg-white/10 border-white/10 text-blue-100'
            }`}>
              <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#22FF88]' : 'bg-white'} animate-pulse`} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Premium Member</span>
            </div>
          </motion.div>

          {/* Compact Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mt-7 w-full max-w-[300px] gap-8 border-t border-white/5 pt-5"
          >
            <div className="text-center">
              <p className="text-base font-black font-display text-white">12</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-base font-black font-display text-white">₹4.8k</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Spent</p>
            </div>
            <div className="text-center">
              <p className="text-base font-black font-display text-white">4.9</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
                Level <Star size={8} className="text-[#FFD600] fill-[#FFD600]" />
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-8 space-y-3.5">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98, x: 4 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.05) }}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full p-4 rounded-[24px] flex items-center group transition-all duration-300 border ${
                isDark 
                  ? 'bg-white/[0.03] border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5' 
                  : 'bg-white border-blue-50/50 shadow-[0_4px_20px_rgba(10,31,68,0.02)] hover:shadow-[0_8px_30px_rgba(10,31,68,0.06)] hover:border-blue-200'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} mr-4 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={20} />
              </div>
              <span className={`flex-1 text-left font-bold text-base tracking-tight transition-colors ${
                isDark ? 'text-white/70 group-hover:text-white' : 'text-[#0A1F44]/70 group-hover:text-[#0A1F44]'
              }`}>{item.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDark ? 'bg-white/5 text-white/20' : 'bg-blue-50 text-blue-200'
              } group-hover:bg-blue-500 group-hover:text-white group-hover:rotate-[-45deg]`}>
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </motion.button>
          );
        })}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={() => navigate('/login')}
          className={`w-full p-4 rounded-[24px] flex items-center mt-6 group transition-all duration-300 border ${
            isDark 
              ? 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20' 
              : 'bg-red-50 border-red-100/50 shadow-[0_8px_25px_rgba(239,68,68,0.05)] hover:shadow-[0_12px_35px_rgba(239,68,68,0.1)] hover:border-red-200'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-500">
            <LogOut size={20} strokeWidth={2.5} />
          </div>
          <span className="flex-1 text-left font-bold text-red-500 text-base tracking-tight">Logout</span>
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
            <ChevronRight size={16} strokeWidth={3} />
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
