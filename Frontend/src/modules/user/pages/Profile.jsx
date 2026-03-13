import { useNavigate } from 'react-router-dom';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const menuItems = [
    { icon: User, label: 'Edit Profile', color: 'text-[#22FF88]', bg: 'bg-[#22FF88]/10' },
    { icon: History, label: 'Booking History', color: 'text-[#1EE7FF]', bg: 'bg-[#1EE7FF]/10' },
    { icon: Wallet, label: 'My Wallet', color: 'text-[#FFD600]', bg: 'bg-[#FFD600]/10' },
    { icon: Bell, label: 'Notifications', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: Shield, label: 'Privacy & Security', color: 'text-white/40', bg: 'bg-white/5' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-white/40', bg: 'bg-white/5' },
  ];

  return (
    <div className="min-h-screen pb-28">
      {/* Profile Header */}
      <div className="px-6 pt-10 pb-10 relative overflow-hidden">
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
        <div className="absolute inset-0 court-lines opacity-20" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#22FF88]/5 via-transparent to-transparent" />

        <div className="flex flex-col items-center relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-[32px] overflow-hidden border-2 transition-colors ${isDark ? 'border-[#22FF88]/20 shadow-[0_0_30px_rgba(34,255,136,0.1)]' : 'border-[#22FF88]/40 shadow-xl shadow-blue-900/5'}`}>
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <button className={`absolute -bottom-1 -right-1 w-9 h-9 bg-[#22FF88] text-[#08142B] rounded-xl border-4 flex items-center justify-center active:scale-90 transition-all ${isDark ? 'border-[#08142B]' : 'border-white'}`}>
              <Pencil size={14} />
            </button>
          </div>

          <h2 className={`mt-5 text-xl font-black tracking-tight font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Muhammad Haroos</h2>
          <p className="text-[#22FF88]/50 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Premium Member</p>

          {/* Stats */}
          <div className="flex items-center mt-8 w-full glass-card rounded-3xl p-5">
            <div className="flex-1 text-center">
              <p className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>12</p>
              <p className="text-[9px] font-extrabold text-white/20 uppercase tracking-[0.15em] mt-0.5">Bookings</p>
            </div>
            <div className="w-[1px] h-8 bg-white/5" />
            <div className="flex-1 text-center">
              <p className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹4.8k</p>
              <p className="text-[9px] font-extrabold text-white/20 uppercase tracking-[0.15em] mt-0.5">Spent</p>
            </div>
            <div className="w-[1px] h-8 bg-white/5" />
            <div className="flex-1 text-center">
              <p className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>4.9</p>
              <p className="text-[9px] font-extrabold text-white/20 uppercase tracking-[0.15em] mt-0.5 flex items-center justify-center gap-1">
                Rating <Star size={9} className="text-[#FFD600] fill-[#FFD600]" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 py-2 space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full glass-card p-4 rounded-2xl flex items-center group hover:border-[#22FF88]/10 active:bg-white/5 transition-all"
            >
              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mr-4 group-hover:scale-110 transition-transform`}>
                <Icon size={16} />
              </div>
              <span className={`flex-1 text-left font-bold text-sm tracking-tight ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>{item.label}</span>
            <ChevronRight size={16} className={isDark ? 'text-white/15 group-hover:text-white/30' : 'text-[#0A1F44]/15 group-hover:text-[#0A1F44]/30'} />
            </motion.button>
          );
        })}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="w-full bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center mt-4 group hover:bg-red-500/10 active:bg-red-500/15 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center mr-4 text-red-400">
            <LogOut size={16} />
          </div>
          <span className="flex-1 text-left font-bold text-red-400/70 text-sm tracking-tight">Logout</span>
          <ChevronRight size={16} className="text-red-400/20" />
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
