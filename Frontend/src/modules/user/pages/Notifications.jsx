import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Wallet, Tag, Info, CheckCircle, Clock } from 'lucide-react';
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
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
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
    <div className={`min-h-screen pb-32 relative overflow-hidden ${isDark ? '' : 'bg-slate-50/50'}`}>
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main Container for Compact Desktop View */}
      <div className="max-w-2xl mx-auto md:pt-12 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full overflow-hidden md:rounded-none rounded-none md:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] md:border transition-all duration-500 ${
            isDark ? 'md:bg-[#08142B] md:border-white/10' : 'md:bg-white md:border-slate-100'
          }`}
        >
          {/* Header */}
          <div className={`px-6 pt-5 pb-5 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`w-10 h-10 md:rounded-none rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-blue-100 text-[#0A1F44] shadow-sm'}`}
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className={`text-lg font-bold font-display uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Notifications</h1>
            </div>
          </div>

          <div className="px-6 md:px-10 py-8 space-y-4">
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 md:rounded-none rounded-[28px] border flex gap-4 transition-all duration-300 ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-blue-50 shadow-sm hover:shadow-md hover:border-blue-100'}`}
              >
                <div className={`w-12 h-12 md:rounded-none rounded-[18px] flex-shrink-0 flex items-center justify-center ${notif.bg} ${notif.color} transition-transform group-hover:scale-110`}>
                  <notif.icon size={22} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-black text-[15px] tracking-tight ${isDark ? 'text-white/90' : 'text-[#0A1F44]'}`}>{notif.title}</h4>
                    <div className="flex items-center gap-1 opacity-40">
                      <Clock size={10} strokeWidth={3} />
                      <span className={`text-[10px] font-black uppercase ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{notif.time.split(' ')[0]} {notif.time.split(' ')[1].charAt(0)}</span>
                    </div>
                  </div>
                  <p className={`text-sm mt-1 leading-relaxed ${isDark ? 'text-white/50' : 'text-[#0A1F44]/50'}`}>{notif.message}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 md:rounded-none rounded-md ${notif.bg} ${notif.color}`}>{notif.type}</span>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-blue-200'}`}>{notif.time}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className={`w-20 h-20 md:rounded-none rounded-[32px] flex items-center justify-center mb-6 ${isDark ? 'bg-white/5 text-white/20' : 'bg-blue-50 text-blue-200'}`}>
                  <Bell size={32} />
                </div>
                <h3 className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>No Notifications</h3>
                <p className={`text-sm mt-3 leading-relaxed opacity-50 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Stay tuned! We'll notify you when something exciting happens.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
