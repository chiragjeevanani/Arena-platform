import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, Settings, LogOut, Calendar, Target, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { useTheme } from '../../user/context/ThemeContext';

const AdminTopbar = ({ isCollapsed, setIsCollapsed, onMobileMenuClick }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', title: 'New Booking', desc: 'Court A booked for 8:00 PM', time: '2 MINS AGO', unread: true },
    { id: 2, type: 'maintenance', title: 'Maintenance Alert', desc: 'Court C plumbing check scheduled', time: '1 HR AGO', unread: true },
    { id: 3, type: 'payment', title: 'Payment Received', desc: '1.200 OMR received from Rahul', time: '3 HRS AGO', unread: true },
    { id: 4, type: 'alert', title: 'Peak Hours Active', desc: 'Evening peak pricing is now live', time: '5 HRS AGO', unread: true },
    { id: 5, type: 'booking', title: 'New Booking', desc: 'Court B booked for 9:00 PM', time: '6 HRS AGO', unread: false },
    { id: 6, type: 'maintenance', title: 'Maintenance Alert', desc: 'Court A light fixed', time: '1 DAY AGO', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const visibleNotifications = isExpanded ? notifications : notifications.slice(0, 3);

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return { icon: Calendar, bg: 'bg-red-50', text: 'text-[#CE2029]' };
      case 'maintenance': return { icon: Target, bg: 'bg-amber-50', text: 'text-amber-500' };
      case 'payment': return { icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-500' };
      case 'alert': return { icon: Clock, bg: 'bg-indigo-50', text: 'text-indigo-500' };
      default: return { icon: Bell, bg: 'bg-slate-50', text: 'text-slate-500' };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-20 bg-[#E8EDF2] border-b border-[#D9E2EC] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburger */}
        <button
          onClick={onMobileMenuClick}
          className={`md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm`}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Right part: Actions & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
                setShowNotificationsMenu(!showNotificationsMenu);
                if (showProfileMenu) setShowProfileMenu(false);
            }}
            className="relative w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#CE2029] flex items-center justify-center shadow-sm transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#CE2029] border-2 border-inherit shadow-[0_0_5px_rgba(206, 32, 41,0.5)]" />}
          </button>

          <AnimatePresence>
            {showNotificationsMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-3 w-80 rounded-[1.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden py-2 bg-white text-[#36454F] z-50"
              >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                     <p className="text-sm font-black uppercase tracking-widest text-[#36454F]">Notifications</p>
                     <p className="text-[10px] font-bold text-slate-500 mt-0.5">Manager Activity Feed</p>
                  </div>
                  {unreadCount > 0 && (
                     <div className="bg-[#CE2029]/10 text-[#CE2029] px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase">
                        {unreadCount} NEW
                     </div>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {visibleNotifications.map(n => {
                        const { icon: Icon, bg, text } = getIcon(n.type);
                        return (
                            <div key={n.id} className={`px-5 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-4 ${n.unread ? 'bg-white' : 'opacity-60 bg-slate-50/50'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${text}`}>
                                   <Icon size={18} strokeWidth={2.5} />
                                </div>
                                <div className="pt-0.5">
                                    <p className="text-xs font-bold text-[#36454F] mb-0.5">{n.title}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">{n.desc}</p>
                                    <p className="text-[9px] text-[#94A3B8] mt-1.5 font-bold uppercase tracking-widest">{n.time}</p>
                                </div>
                            </div>
                        )
                    })}
                    {notifications.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                    )}
                </div>
                <div className="bg-slate-50 flex items-center divide-x divide-slate-200 border-t border-slate-100">
                   <button 
                      onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}
                      className="flex-1 py-3.5 text-center hover:bg-slate-100 transition-colors text-[10px] font-black uppercase tracking-[0.1em] text-slate-500"
                   >
                      MARK ALL READ
                   </button>
                   {notifications.length > 3 && (
                      <button 
                         onClick={() => setIsExpanded(!isExpanded)}
                         className="flex-1 py-3.5 text-center hover:bg-slate-100 transition-colors text-[10px] font-black uppercase tracking-[0.1em] text-[#CE2029]"
                      >
                         {isExpanded ? 'SHOW LESS' : 'VIEW ALL'}
                      </button>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button 
          onClick={() => navigate('/admin/settings')}
          className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#CE2029] flex items-center justify-center shadow-sm transition-all"
        >
          <Settings size={18} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
                if (!user) {
                  navigate('/admin/login');
                  return;
                }
                setShowProfileMenu(!showProfileMenu);
                if (showNotificationsMenu) setShowNotificationsMenu(false);
            }}
            className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-xl border border-slate-200 bg-white hover:border-[#CE2029] hover:shadow-sm transition-all text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-[#36454F] tracking-wide">{user?.role?.replace('_', ' ')}</p>
              <p className="text-[9px] font-bold text-[#CE2029] uppercase tracking-wider">{user?.name}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-[#CE2029]/20 shadow-sm transition-transform group-active:scale-95">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-crop" />
              ) : (
                <UserCircle size={20} className="text-[#CE2029]" />
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
                className="absolute right-0 mt-3 w-64 rounded-[1.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden py-2 bg-white text-[#36454F]"
              >
                <div className="px-5 py-3 border-b border-slate-100 mb-2">
                  <p className="text-xs font-black uppercase tracking-widest">{user?.name}</p>
                  <p className="text-[10px] font-bold opacity-40 truncate">{user?.email}</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <button 
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#CE2029] hover:bg-slate-50 flex items-center gap-3 transition-colors rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                      <Settings size={14} />
                    </div>
                    Account Settings
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#CE2029] hover:bg-slate-50 flex items-center gap-3 transition-colors rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                      <Bell size={14} />
                    </div>
                    Global Notifications
                  </button>

                  <div className="h-[1px] my-2 bg-slate-100" />

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

export default AdminTopbar;
