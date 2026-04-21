import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, Settings, LogOut, Building2, Calendar, Target, Clock as ClockIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { useArenaPanel } from '../../admin/context/ArenaPanelContext';

const ArenaTopbar = ({ isCollapsed, onMobileMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { arena } = useArenaPanel();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);

  const notifications = [];

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/arena/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

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

        {/* Search bar removed */}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); setIsNotificationsExpanded(false); }}
            className={`relative w-10 h-10 rounded-xl border bg-white flex items-center justify-center transition-all shadow-sm ${showNotifications ? 'border-[#CE2029] text-[#CE2029]' : 'border-slate-200 text-slate-500 hover:text-[#CE2029]'}`}
          >
            <Bell size={17} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#CE2029] border-2 border-white" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white z-20 text-[#36454F]"
                >
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Manager Activity Feed</p>
                    </div>
                    <span className="text-[9px] font-bold text-[#CE2029] bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {notifications.length ? `${notifications.length} New` : 'Live'}
                    </span>
                  </div>

                  <motion.div 
                    animate={{ maxHeight: isNotificationsExpanded ? 500 : 300 }}
                    className="overflow-y-auto scrollbar-hide py-2 transition-all duration-300"
                  >
                    {[...notifications, ...(isNotificationsExpanded ? notifications : [])].map((n, idx) => (
                      <button key={`${n.id}-${idx}`} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-3 transition-colors group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${n.color}10` }}>
                          <n.icon size={16} style={{ color: n.color }} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 leading-none mb-1">{n.title}</p>
                          <p className="text-[10px] font-semibold text-slate-400 line-clamp-1">{n.desc}</p>
                          <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>

                  <button 
                    onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
                    className="w-full py-3 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-[#CE2029] hover:bg-slate-100 transition-all border-t border-slate-100"
                  >
                    {isNotificationsExpanded ? 'Show Less' : 'View All Activities'}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-[#CE2029] hover:shadow-sm transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-[#36454F] tracking-wide">{user?.name || 'Arena Manager'}</p>
              <p className="text-[9px] font-bold text-[#CE2029] uppercase tracking-wider">{arena?.name || 'Local Cluster'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#CE2029]/10 flex items-center justify-center border border-[#CE2029]/20 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Manager" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={18} className="text-[#CE2029]" />
              )}
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
                  className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-2 bg-white z-20 text-[#36454F]"
                >
                  <div className="px-5 py-3 border-b border-slate-100 mb-2">
                    <p className="text-xs font-black uppercase tracking-widest">{user?.name || 'Manager'}</p>
                    <p className="text-[10px] font-bold opacity-40 truncate">{user?.email || 'N/A'}</p>
                  </div>

                  <div className="px-2 space-y-1">
                    <button 
                      onClick={() => { setShowProfileMenu(false); navigate('/arena/account-settings'); }}
                      className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#CE2029] hover:bg-slate-50 flex items-center gap-3 transition-colors rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                        <Settings size={13} />
                      </div>
                      Account Settings
                    </button>

                    <div className="h-px my-1 bg-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut size={13} className="text-red-500" />
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
