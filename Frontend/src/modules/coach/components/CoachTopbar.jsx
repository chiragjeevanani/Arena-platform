import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { useTheme } from '../../user/context/ThemeContext';

const CoachTopbar = ({ isCollapsed, setIsCollapsed, onMobileMenuClick }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className={`h-20 border-b flex items-center justify-between px-6 sticky top-0 z-40 ${
      isDark ? 'bg-[#0f1115] border-white/5' : 'bg-[#E8EDF2] border-[#D9E2EC]'
    }`}>
      {/* Left part: Hamburger (mobile) + Search Bar */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburger */}
        <button
          onClick={onMobileMenuClick}
          className={`md:hidden p-2 rounded-xl border shadow-sm ${
            isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
          }`}
        >
          <Menu size={18} />
        </button>

        <div className="relative w-full max-w-md hidden md:block group">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? 'text-white/20 group-focus-within:text-[#eb483f]' : 'text-slate-400 group-focus-within:text-[#eb483f]'
          }`} />
          <input
            type="text"
            placeholder="Search everything..."
            className={`w-full border rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium transition-all shadow-sm outline-none ${
              isDark 
                ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#eb483f] focus:bg-white/10' 
                : 'bg-slate-50 border-slate-200 text-[#1a2b3c] placeholder:text-slate-400 focus:border-[#eb483f] focus:bg-white'
            }`}
          />
        </div>
      </div>

      {/* Right part: Actions & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Notifications */}
        <button className={`relative w-10 h-10 rounded-lg border flex items-center justify-center shadow-sm transition-all ${
          isDark 
            ? 'bg-white/5 border-white/5 text-white/40 hover:text-[#eb483f]' 
            : 'border-slate-200 bg-white text-slate-500 hover:text-[#eb483f]'
        }`}>
          <Bell size={18} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#eb483f] border-2 border-inherit shadow-[0_0_5px_rgba(235,72,63,0.5)]" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-xl border transition-all text-left ${
              isDark ? 'bg-white/5 border-white/5 hover:border-[#eb483f]' : 'border-slate-200 bg-white hover:border-[#eb483f] hover:shadow-sm'
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className={`text-[11px] font-bold tracking-wide ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>COACH</p>
              <p className="text-[9px] font-bold text-[#eb483f] uppercase tracking-wider">{user?.name || 'Vikram Singh'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-[#eb483f]/20 shadow-sm transition-transform group-active:scale-95">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-crop" />
              ) : (
                <div className="bg-gradient-to-br from-[#eb483f]/20 to-[#FF4B4B]/20 w-full h-full flex items-center justify-center">
                  <UserCircle size={20} className="text-[#eb483f]" />
                </div>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`absolute right-0 mt-3 w-64 rounded-[1.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden py-2 z-50 ${
                  isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-[#1a2b3c]'
                }`}
              >
                <div className={`px-5 py-3 border-b mb-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className="text-xs font-black uppercase tracking-widest">{user?.name || 'Vikram Singh'}</p>
                  <p className={`text-[10px] font-bold opacity-40 truncate ${isDark ? 'text-white/60' : ''}`}>{user?.email || 'vikram@ammsports.com'}</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <button 
                    onClick={() => {
                      navigate('/coach/settings');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-3 transition-colors rounded-xl ${
                      isDark ? 'text-white/60 hover:text-[#eb483f] hover:bg-white/5' : 'text-slate-600 hover:text-[#eb483f] hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                      <Settings size={14} />
                    </div>
                    Account Settings
                  </button>
                  
                  <button className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-3 transition-colors rounded-xl ${
                    isDark ? 'text-white/60 hover:text-[#eb483f] hover:bg-white/5' : 'text-slate-600 hover:text-[#eb483f] hover:bg-slate-50'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                      <Bell size={14} />
                    </div>
                    Global Notifications
                  </button>

                  <div className={`h-[1px] my-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#FF4B4B] hover:bg-[#FF4B4B]/5 flex items-center gap-3 transition-colors rounded-xl"
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

export default CoachTopbar;
