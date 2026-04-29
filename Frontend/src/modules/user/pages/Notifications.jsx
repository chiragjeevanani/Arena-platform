import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Wallet, Tag, CheckCircle, Clock, AlertCircle, GraduationCap, CheckCheck, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  listNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from '../../../services/notificationsApi';

const TYPE_MAP = {
  success: { icon: CheckCircle, color: '#22c55e', label: 'Success' },
  info: { icon: Info, color: '#3b82f6', label: 'Info' },
  warning: { icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  error: { icon: XCircle, color: '#CE2029', label: 'Alert' },
};

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await listNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(p => p.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={`min-h-screen pb-28 ${isDark ? 'bg-[#0f1115]' : 'bg-[#f8fafc]'}`}>

      {/* ── Compact Header ── */}
      <div className="bg-[#CE2029] px-4 pt-4 pb-4 shadow-[0_4px_20px_rgba(206, 32, 41,0.25)]">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-black text-white tracking-tight leading-none">Notifications</h1>
              {unreadCount > 0 && (
                <span className="w-[18px] h-[18px] rounded-full bg-white text-[#CE2029] text-[9px] font-black flex items-center justify-center shrink-0">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/60 font-bold mt-0.5 uppercase tracking-widest">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              <CheckCheck size={11} strokeWidth={3} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="max-w-lg mx-auto px-4 py-3 space-y-1.5">
        
        {loading ? (
           <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-white/10 border-t-[#CE2029] rounded-full animate-spin mx-auto" />
           </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 px-1 pt-1 pb-0.5">
                Unread
              </p>
            )}

            <AnimatePresence initial={false}>
              {notifications.map((n, idx) => {
                const config = TYPE_MAP[n.type] || TYPE_MAP.info;
                const Icon = config.icon;
                const isFirstRead = n.isRead && (idx === 0 || !notifications[idx - 1]?.isRead);
                return (
                  <motion.div key={n.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, delay: idx * 0.03 }}>
                    {/* "Earlier" divider */}
                    {isFirstRead && unreadCount > 0 && (
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 px-1 pt-3 pb-1.5">Earlier</p>
                    )}

                    <button
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all active:scale-[0.98] relative ${
                        n.isRead
                          ? isDark ? 'bg-white/3 opacity-55' : 'bg-white/60 opacity-70'
                          : isDark ? 'bg-white/8 border border-white/8 shadow-sm' : 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-[#CE2029]/15'
                      }`}
                    >
                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="absolute top-3.5 right-3.5 w-[7px] h-[7px] rounded-full bg-[#CE2029]" />
                      )}

                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${config.color}12` }}
                      >
                        <Icon size={18} strokeWidth={2.5} style={{ color: config.color }} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`text-[13px] leading-tight font-black truncate ${isDark ? 'text-white' : 'text-[#36454F]'} ${n.isRead ? 'font-semibold opacity-70' : ''}`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 shrink-0">{formatTime(n.createdAt)}</span>
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-snug truncate ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                          {n.message}
                        </p>
                        {/* Type pill */}
                        <span
                          className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ color: config.color, backgroundColor: `${config.color}15` }}
                        >
                          {config.label}
                        </span>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDelete(e, n.id)}
                        className="absolute bottom-3 right-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-300"
                      >
                        <Trash2 size={12} />
                      </button>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
              <Bell size={28} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-500'}`}>No Notifications</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
