import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Wallet, Tag, CheckCircle, Clock, AlertCircle, GraduationCap, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TYPE_LABEL = {
  booking: 'Booking',
  reminder: 'Reminder',
  coaching: 'Coaching',
  wallet: 'Wallet',
  offer: 'Offer',
  system: 'System',
  payment: 'Payment',
};

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking',  read: false, title: 'Booking Confirmed!',          message: 'Court 2 · Mar 20, 07:00–08:00 PM · OMR 4.500', time: '2h ago',  icon: Calendar,      color: '#22c55e', bg: '#22c55e' },
    { id: 2, type: 'reminder', read: false, title: 'Slot Reminder — 1 Hour Left', message: 'Amm Sports Arena · Court 2 · 07:00 PM',              time: '45m ago', icon: Clock,          color: '#3b82f6', bg: '#3b82f6' },
    { id: 3, type: 'coaching', read: false, title: 'Coaching Session Tomorrow',   message: 'Vikram Singh · Morning Elite · 06:00 AM',             time: '3h ago',  icon: GraduationCap,  color: '#eb483f', bg: '#eb483f' },
    { id: 4, type: 'wallet',   read: true,  title: 'Low Wallet Balance',          message: 'Balance: OMR 1.450 — Top up to keep booking',         time: '5h ago',  icon: Wallet,         color: '#f59e0b', bg: '#f59e0b' },
    { id: 5, type: 'offer',    read: true,  title: 'Weekend Deal — 20% Off!',     message: 'Sat & Sun courts · Code: WEEKEND20 · Till Nov 30',    time: '1d ago',  icon: Tag,            color: '#a855f7', bg: '#a855f7' },
    { id: 6, type: 'system',   read: true,  title: 'Profile Updated',             message: 'Your photo & contact details were updated',           time: '2d ago',  icon: CheckCircle,    color: '#64748b', bg: '#64748b' },
    { id: 7, type: 'payment',  read: true,  title: 'Payment Received',            message: 'OMR 10.000 credited · Debit •••4521 · #TU-1029',      time: '3d ago',  icon: AlertCircle,    color: '#22c55e', bg: '#22c55e' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className={`min-h-screen pb-28 ${isDark ? 'bg-[#0f1115]' : 'bg-[#f8fafc]'}`}>

      {/* ── Compact Header ── */}
      <div className="bg-[#eb483f] px-4 pt-4 pb-4 shadow-[0_4px_20px_rgba(235,72,63,0.25)]">
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
                <span className="w-[18px] h-[18px] rounded-full bg-white text-[#eb483f] text-[9px] font-black flex items-center justify-center shrink-0">
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
              onClick={markAllRead}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              <CheckCheck size={11} strokeWidth={3} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="max-w-lg mx-auto px-4 py-3 space-y-1.5">

        {/* Section label */}
        {unreadCount > 0 && (
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 px-1 pt-1 pb-0.5">
            Unread
          </p>
        )}

        <AnimatePresence initial={false}>
          {notifications.map((n, idx) => {
            const Icon = n.icon;
            const isFirstRead = n.read && (idx === 0 || !notifications[idx - 1]?.read);
            return (
              <motion.div key={n.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, delay: idx * 0.03 }}>
                {/* "Earlier" divider */}
                {isFirstRead && unreadCount > 0 && (
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 px-1 pt-3 pb-1.5">Earlier</p>
                )}

                <button
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all active:scale-[0.98] relative ${
                    n.read
                      ? isDark ? 'bg-white/3 opacity-55' : 'bg-white/60 opacity-70'
                      : isDark ? 'bg-white/8 border border-white/8 shadow-sm' : 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-[#eb483f]/15'
                  }`}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <div className="absolute top-3.5 right-3.5 w-[7px] h-[7px] rounded-full bg-[#eb483f]" />
                  )}

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${n.bg}12` }}
                  >
                    <Icon size={18} strokeWidth={2.5} style={{ color: n.color }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pr-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[13px] leading-tight font-black truncate ${isDark ? 'text-white' : 'text-[#1a2b3c]'} ${n.read ? 'font-semibold opacity-70' : ''}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-snug truncate ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                      {n.message}
                    </p>
                    {/* Type pill */}
                    <span
                      className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ color: n.color, backgroundColor: `${n.bg}15` }}
                    >
                      {TYPE_LABEL[n.type]}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

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
