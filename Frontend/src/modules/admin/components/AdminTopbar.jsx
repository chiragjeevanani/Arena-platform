import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const AdminTopbar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <header className={`h-20 backdrop-blur-3xl border-b flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-500 ${
      isDark ? 'bg-[#08142B]/90 border-[#22FF88]/10 shadow-none' : 'bg-white/80 border-[#0A1F44]/10 shadow-sm'
    }`}>
      {/* Left part: Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block group">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? 'text-white/30 group-focus-within:text-[#1EE7FF]' : 'text-[#0A1F44]/30 group-focus-within:text-[#22FF88]'
          }`} />
          <input
            type="text"
            placeholder="Search everything..."
            className={`w-full border rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium transition-all focus:outline-none ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-[#22FF88]/10 text-white placeholder:text-white/20 focus:border-[#1EE7FF]/50 focus:bg-[#0A1F44] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' 
                : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44] placeholder:text-[#0A1F44]/30 focus:border-[#22FF88] focus:bg-white shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* Right part: Actions & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Arena Switcher */}
        <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
          isDark ? 'border-white/5 bg-white/5 text-white hover:bg-white/10' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44] hover:bg-[#0A1F44]/5 shadow-sm'
        }`}>
          <div className="w-2 h-2 rounded-full bg-[#22FF88] animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest italic font-display">Olympic Arena</span>
          <ChevronDown size={14} className="opacity-40" />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl transition-all duration-300 border ${
            isDark 
              ? 'border-white/10 bg-white/5 text-white/60 hover:text-[#FFD600]' 
              : 'border-[#0A1F44]/10 bg-white text-[#0A1F44]/60 hover:text-[#22FF88] shadow-sm'
          }`}
        >
          <motion.div initial={false} animate={{ rotate: isDark ? 0 : 180 }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.div>
        </button>

        {/* Notifications */}
        <button className={`relative w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
          isDark ? 'border-white/10 text-white/60 hover:text-white hover:bg-white/5' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44]/60 hover:text-[#0A1F44] shadow-sm'
        }`}>
          <Bell size={18} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FFD600] border-2 border-inherit shadow-[0_0_5px_rgba(255,214,0,0.5)]" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-2xl border transition-all ${
              isDark 
                ? 'border-white/5 bg-[#0A1F44]/50 hover:bg-[#0A1F44] hover:border-[#22FF88]/30' 
                : 'border-[#0A1F44]/10 bg-white hover:border-[#22FF88] shadow-sm'
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Super Admin</p>
              <p className="text-[8px] font-black text-[#1EE7FF] uppercase tracking-[0.2em] mt-0.5">Arena Manager</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1EE7FF]/20 to-[#22FF88]/20 border border-[#22FF88]/30 flex items-center justify-center text-[#22FF88] shadow-lg shadow-[#22FF88]/10 transition-transform group-active:scale-95">
              <UserCircle size={20} />
            </div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`absolute right-0 mt-3 w-64 rounded-[1.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden py-2 backdrop-blur-xl ${
                  isDark ? 'bg-[#0A1F44]/95 border-white/10 text-white' : 'bg-white border-black/5 text-[#0A1F44]'
                }`}
              >
                <div className={`px-5 py-3 border-b mb-2 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                  <p className="text-xs font-black uppercase tracking-widest">Admin Control</p>
                  <p className={`text-[10px] font-bold opacity-40 truncate`}>admin@badminton.io</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <button 
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:rounded-xl flex items-center gap-3 transition-all ${
                      isDark ? 'hover:bg-white/5 text-white/70 hover:text-[#22FF88]' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/70 hover:text-[#22FF88]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#1EE7FF]/10 flex items-center justify-center text-[#1EE7FF]">
                      <Settings size={14} />
                    </div>
                    Account Settings
                  </button>
                  
                  <button className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:rounded-xl flex items-center gap-3 transition-all ${
                    isDark ? 'hover:bg-white/5 text-white/70 hover:text-[#1EE7FF]' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/70 hover:text-[#1EE7FF]'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600]">
                      <Bell size={14} />
                    </div>
                    Global Notifications
                  </button>

                  <div className={`h-[1px] my-2 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 transition-all hover:bg-[#FF4B4B]/10 text-[#FF4B4B]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FF4B4B]/10 flex items-center justify-center">
                      <LogOut size={14} />
                    </div>
                    Terminate Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
