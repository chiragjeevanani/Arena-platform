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

      <div className={`rounded-3xl p-5 transition-all duration-300 group border ${
        isDark 
          ? 'glass-card border-white/5 bg-white/5 hover:border-[#22FF88]/20' 
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-[#22FF88]/30'
      }`}>
        <div className="flex items-start gap-4">
          {/* Timeline dot */}
          <div className="flex-shrink-0 mt-1">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-[#22FF88]" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#22FF88] animate-ping opacity-30" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{booking.arenaName}</h4>
                <p className="text-[10px] text-[#22FF88]/60 font-bold uppercase tracking-[0.15em] mt-0.5">
                  {booking.courtName}
                </p>
              </div>
              <div className="glass-neon px-2.5 py-1 rounded-xl">
                <span className="text-[10px] font-bold text-[#22FF88] uppercase tracking-wider">
                  {booking.status}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-6 py-3 border-t border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Calendar size={13} className={isDark ? 'text-white/20' : 'text-slate-300'} />
                <span className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className={isDark ? 'text-white/20' : 'text-slate-300'} />
                <span className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>{booking.slot}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              {booking.status === 'Upcoming' && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#FFD600]/70 uppercase tracking-wider">
                    Starts in {countdown}
                  </span>
                </div>
              )}
              {booking.status === 'Completed' && (
                <span className={`text-xs font-black ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>₹{booking.price}</span>
              )}
              <button className="flex items-center gap-1 text-[#22FF88] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                View <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingTimelineCard;
