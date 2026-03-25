import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, Settings, LogOut, Building2 } from 'lucide-react';

const ArenaTopbar = ({ isCollapsed, onMobileMenuClick }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-20 bg-[#E8EDF2] border-b border-[#D9E2EC] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburger */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 rounded-xl border border-[#D9E2EC] bg-white text-slate-600 hover:text-slate-900 shadow-sm"
        >
          <Menu size={18} />
        </button>

        {/* Search bar */}
        <div className="relative w-full max-w-md hidden md:block group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
          <input
            type="text"
            placeholder="Search courts, slots, bookings..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-[13px] font-medium text-[#1a2b3c] placeholder:text-slate-400 focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Arena label */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#eb483f]/20 shadow-sm">
          <Building2 size={14} className="text-[#eb483f]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#eb483f]">Arena Panel</span>
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#eb483f] flex items-center justify-center transition-all shadow-sm">
          <Bell size={17} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#eb483f] border-2 border-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-[#eb483f] hover:shadow-sm transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-[#1a2b3c] tracking-wide">Arena Manager</p>
              <p className="text-[9px] font-bold text-[#eb483f] uppercase tracking-wider">Phoenix Sports</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#eb483f]/10 flex items-center justify-center border border-[#eb483f]/20">
              <UserCircle size={18} className="text-[#eb483f]" />
            </div>
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-2 bg-white z-20 text-[#1a2b3c]"
                >
                  <div className="px-5 py-3 border-b border-slate-100 mb-2">
                    <p className="text-xs font-black uppercase tracking-widest">Arena Manager</p>
                    <p className="text-[10px] font-bold opacity-40 truncate">manager@phoenix.com</p>
                  </div>

                  <div className="px-2 space-y-1">
                    <button className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#eb483f] hover:bg-slate-50 flex items-center gap-3 transition-colors rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Settings size={13} />
                      </div>
                      Account Settings
                    </button>

                    <div className="h-px my-1 bg-slate-100" />

                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/arena/login'); }}
                      className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut size={13} className="text-white" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default ArenaTopbar;
