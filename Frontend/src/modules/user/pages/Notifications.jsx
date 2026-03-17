import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Wallet, Tag, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed!',
      message: 'Your slot at Smash Factor Arena is confirmed for Mar 14, 05:00 PM.',
      time: '2 hours ago',
      icon: Calendar,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 2,
      type: 'wallet',
      title: 'Low Wallet Balance',
      message: 'Your wallet balance is below ₹200. Top up now to continue booking.',
      time: '5 hours ago',
      icon: Wallet,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 3,
      type: 'offer',
      title: 'Super Weekend Deal!',
      message: 'Get 30% off on all wooden courts this Sunday. Use code: WOOD30',
      time: '1 day ago',
      icon: Tag,
      color: 'text-[#eb483f]',
      bg: 'bg-[#eb483f]/10'
    },
    {
      id: 4,
      type: 'system',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      time: '2 days ago',
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main Container for Compact Desktop View */}
      <div className="max-w-2xl mx-auto pt-4 md:pt-12 px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full overflow-hidden rounded-[24px] md:rounded-[32px] md:shadow-2xl md:border transition-all duration-500 ${
            isDark ? 'bg-[#1a1d24] md:border-white/5' : 'bg-white md:bg-white md:border-[#eb483f]/10 md:shadow-[0_20px_50px_-12px_rgba(235,72,63,0.1)]'
          }`}
        >
          {/* Header */}
          <div className={`px-5 pt-4 pb-4 md:px-8 md:pt-6 md:pb-6 backdrop-blur-xl border-b transition-all ${
            isDark 
              ? 'bg-[#1a1d24]/90 border-white/5' 
              : 'bg-[#eb483f] border-[#eb483f] shadow-lg shadow-[#eb483f]/20'
          }`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`w-10 h-10 rounded-[16px] flex items-center justify-center border active:scale-95 transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-white/10 border-white/20 text-white hover:border-white/40 hover:bg-white/20'
                }`}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className={`text-xl font-black font-display tracking-tight text-white`}>
                  Notifications
                </h1>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${isDark ? 'text-white/40' : 'text-white/70'}`}>
                  Recent Activity & Alerts
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-3">
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 md:p-5 rounded-[20px] border flex gap-4 transition-all duration-300 group cursor-default ${
                  isDark 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' 
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-[#eb483f]/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-[16px] flex-shrink-0 flex items-center justify-center ${notif.bg} ${notif.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <notif.icon size={22} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {notif.title}
                      {/* Unread indicator dot */}
                      {idx < 2 && <span className="w-1.5 h-1.5 rounded-full bg-[#eb483f] inline-block" />}
                    </h4>
                    <div className="flex items-center gap-1 opacity-60">
                      <Clock size={10} strokeWidth={2.5} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                      <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-slate-400'}`}>
                        {notif.time}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${notif.bg} ${notif.color}`}>
                      {notif.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 border ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white/40' 
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  <Bell size={32} strokeWidth={1.5} />
                </div>
                <h3 className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No Notifications
                </h3>
                <p className={`text-xs mt-2 leading-relaxed max-w-[200px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  Stay tuned! We'll notify you when something exciting happens.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
