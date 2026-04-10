import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { useTheme } from '../../user/context/ThemeContext';

import Logo from '../../../assets/Logo (3).png';

const CoachTopbar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', msg: 'New attendance log required for Morning Elite', time: '5m' },
    { id: 2, type: 'success', msg: 'Attendance report for G1 has been exported', time: '1h' },
    { id: 3, type: 'info', msg: 'Arena 4 booked for weekend special', time: '3h' },
    { id: 4, type: 'critical', msg: 'Payment overdue for Student: Rahul (Batch B2)', time: '5h' },
    { id: 5, type: 'success', msg: 'New student added to Pro Analytics batch', time: '1d' },
    { id: 6, type: 'info', msg: 'Maintenance scheduled for Court 1 (10 AM - 12 PM)', time: '2d' },
    { id: 7, type: 'critical', msg: 'Coach review pending for recent assessment', time: '2d' },
    { id: 8, type: 'success', msg: 'Batch schedule updated for Junior Stars', time: '3d' },
  ]);

  const [isNotifExpanded, setIsNotifExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/coach/login');
  };

  const clearAllNotifications = (e) => {
    e.stopPropagation();
    setNotifications([]);
    setIsNotifExpanded(false);
  };

  return (
    <header className={`h-20 border-b flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-500 bg-[#CE2029] border-white/10`}>
      {/* Left part: Empty (Mobile Logo) */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo Visibility */}
        <div className="md:hidden flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-8 w-auto" />
          <span className={`text-sm font-black tracking-tighter text-white`}>
            ARENA COACH
          </span>
        </div>
      </div>

      {/* Right part: Actions & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              setIsNotifExpanded(false);
            }}
            className={`relative w-10 h-10 rounded-lg border flex items-center justify-center shadow-sm transition-all ${
              isDark 
                ? 'bg-white/10 border-white/10 text-white/60 hover:text-white' 
                : 'border-white/20 bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white border-2 border-[#CE2029] shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`absolute right-[-80px] md:right-0 mt-3 w-[300px] rounded-[1.5rem] border shadow-2xl overflow-hidden z-50 origin-top-right transition-all duration-300 ${
                  isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
                }`}
              >
                <div className={`px-5 py-3 border-b flex justify-between items-center bg-slate-50/50 ${isDark ? 'bg-white/5 border-white/5' : 'border-slate-100'}`}>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Alert Center</h4>
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[8px] font-black uppercase text-[#CE2029] hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className={`overflow-y-auto p-2 space-y-1.5 scrollbar-hide transition-all duration-300 ${isNotifExpanded ? 'max-h-[500px]' : 'max-h-[340px]'}`}>
                  {(isNotifExpanded ? notifications : notifications.slice(0, 3)).length > 0 ? (
                    (isNotifExpanded ? notifications : notifications.slice(0, 3)).map(notif => (
                      <button key={notif.id} className={`w-full text-left p-2.5 rounded-xl flex gap-3 transition-all group ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                          notif.type === 'critical' ? 'bg-[#CE2029]/10 text-[#CE2029]' : 
                          notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {notif.type === 'critical' ? <Bell size={14} strokeWidth={2.5} /> : 
                           notif.type === 'success' ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <Settings size={14} strokeWidth={2.5} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-black leading-tight mb-1 transition-colors group-hover:text-[#CE2029] ${isDark ? 'text-white/90' : 'text-[#1e293b]'}`}>
                            {notif.msg}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">
                              {notif.time} ago
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} className="text-slate-200" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No new alerts</p>
                    </div>
                  )}
                </div>

                {notifications.length > 3 && (
                  <div className={`p-3 text-center border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <button 
                      onClick={() => setIsNotifExpanded(!isNotifExpanded)}
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-[#CE2029]'}`}
                    >
                      {isNotifExpanded ? 'Show Less' : 'View all activity'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-xl border transition-all text-left ${
              isDark ? 'bg-white/10 border-white/10 hover:border-white' : 'border-white/20 bg-white/10 hover:border-white hover:shadow-sm'
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className={`text-[11px] font-bold tracking-wide text-white/60`}>COACH</p>
              <p className="text-[9px] font-bold text-white uppercase tracking-wider">{user?.name || 'Vikram Singh'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-[#CE2029]/20 shadow-sm transition-transform group-active:scale-95">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-crop" />
              ) : (
                <div className="bg-gradient-to-br from-[#CE2029]/20 to-[#FF4B4B]/20 w-full h-full flex items-center justify-center">
                  <UserCircle size={20} className="text-[#CE2029]" />
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
                  isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
                }`}
              >
                <div className={`px-5 py-3 border-b mb-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className="text-xs font-black uppercase tracking-widest">{user?.name || 'Vikram Singh'}</p>
                  <p className={`text-[10px] font-bold opacity-40 truncate ${isDark ? 'text-white/60' : ''}`}>{user?.email || 'vikram@ammsports.com'}</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <button 
                    onClick={() => {
                      navigate('/coach/profile');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-3 transition-colors rounded-xl ${
                      isDark ? 'text-white/60 hover:text-[#CE2029] hover:bg-white/5' : 'text-slate-600 hover:text-[#CE2029] hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                      <UserCircle size={14} />
                    </div>
                    Coach Profile
                  </button>

                  <div className={`h-[1px] my-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#FF4B4B] hover:bg-[#FF4B4B]/5 flex items-center gap-3 transition-colors rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FF4B4B]/10 flex items-center justify-center">
                      <LogOut size={14} />
                    </div>
                    Log out
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
