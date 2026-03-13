import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * BookingTimeline — Timeline-style booking card with countdown timer
 */
const BookingTimelineCard = ({ booking, index = 0 }) => {
  const [countdown, setCountdown] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    // Simple countdown — generates a mock time for demo
    const updateCountdown = () => {
      const hours = Math.floor(Math.random() * 24) + 1;
      const mins = Math.floor(Math.random() * 59);
      setCountdown(`${hours}h ${mins}m`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative"
    >
      {/* Timeline connector */}
      {index > 0 && (
        <div className="absolute -top-6 left-6 w-[2px] h-6 bg-gradient-to-b from-transparent to-[#22FF88]/20" />
      )}

      <div className={`rounded-xl overflow-hidden transition-all duration-500 group border relative flex flex-col ${
        isDark 
          ? 'glass-card border-white/5 bg-white/5 hover:border-[#22FF88]/20 shadow-2xl shadow-black/40' 
          : 'bg-white border-blue-50 shadow-[0_15px_35px_-12px_rgba(10,31,68,0.12)] hover:shadow-[0_25px_50px_-15px_rgba(10,31,68,0.2)] hover:border-blue-200'
      }`}>
        <div className="flex items-stretch h-[160px]">
          {/* Arena Image Section */}
          <div className="w-[110px] relative overflow-hidden flex-shrink-0">
            <img 
              src={booking.arenaImage} 
              alt={booking.arenaName} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-black/60 via-black/20 to-transparent' : 'from-blue-900/40 to-transparent'}`} />
            
            {/* Status vertical badge for completed */}
            {booking.status === 'Completed' ? (
              <div className="absolute top-3 left-0 bg-slate-500/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-r-lg z-10">
                Past
              </div>
            ) : (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#22FF88] text-[#0A1F44] text-[8px] font-black uppercase tracking-widest shadow-lg z-10">
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                Live
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h4 className={`font-black text-[14px] leading-tight tracking-tight line-clamp-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {booking.arenaName}
                </h4>
                <div className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border shrink-0 ${
                  booking.status === 'Upcoming' 
                    ? (isDark ? 'bg-[#22FF88]/10 border-[#22FF88]/20 text-[#22FF88]' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                    : (isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-400')
                }`}>
                  {booking.status}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <MapPin size={10} className={isDark ? 'text-white' : 'text-[#0F172A]'} strokeWidth={3} />
                <span className={`text-[9px] font-bold truncate max-w-[100px] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {booking.location}
                </span>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-2 py-2.5 border-t border-dashed ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <div className="space-y-0.5">
                <p className={`text-[7px] font-black uppercase tracking-[0.15em] opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Date</p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-[#22FF88]" strokeWidth={2.5} />
                  <span className={`text-[10px] font-black tracking-tight ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{booking.date}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className={`text-[7px] font-black uppercase tracking-[0.15em] opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Court</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#22FF88]" />
                  <span className={`text-[10px] font-black text-[#22FF88]`}>{booking.courtName}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
               <div className="space-y-0.5">
                  <p className={`text-[7px] font-black uppercase tracking-[0.15em] opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Time Slot</p>
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-blue-500" strokeWidth={2.5} />
                    <span className={`text-[10px] font-black tracking-tight ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{booking.slot}</span>
                  </div>
               </div>
               {booking.status === 'Completed' && (
                 <span className={`text-[10px] font-black ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>₹{booking.price}</span>
               )}
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className={`p-4 pt-0 flex items-center justify-between gap-3 ${isDark ? '' : 'bg-slate-50/30'}`}>
           {booking.status === 'Upcoming' && (
             <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm border border-slate-100'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-pulse" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-[#FFD600]' : 'text-amber-500'}`}>
                  Starts in {countdown}
                </span>
             </div>
           )}
           <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 ml-auto ${
             isDark 
               ? 'bg-[#22FF88] text-[#0A1F44] shadow-[0_8px_20px_-5px_rgba(34,255,136,0.3)]' 
               : 'bg-[#0F172A] text-white shadow-[0_8px_20px_-5px_rgba(15,23,42,0.3)]'
           }`}>
             View Details <ChevronRight size={12} strokeWidth={4} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingTimelineCard;
