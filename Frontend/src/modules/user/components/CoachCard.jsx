import { motion } from 'framer-motion';
import { Clock, Users, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * CoachCard — Coaching batch card with progress meter and sporty styling
 */
const CoachCard = ({ batch, index = 0 }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  // Mock seats data
  const totalSeats = 12;
  const filledSeats = Math.floor(Math.random() * 8) + 3;
  const seatPercent = (filledSeats / totalSeats) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className={`rounded-[32px] overflow-hidden group transition-all duration-500 border relative ${
        isDark 
          ? 'glass-card border-white/10 bg-white/5 hover:border-[#eb483f]/40 shadow-2xl shadow-black/20' 
          : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-[#eb483f]/10 translate-y-0 hover:-translate-y-2'
      }`}
    >
      {/* Hero Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={batch.image}
          alt={batch.coachName}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        {/* Soft Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Pro Badge */}
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-xl flex items-center gap-2 group-hover:bg-[#eb483f] group-hover:border-[#eb483f] transition-all duration-500">
          <div className="w-2 h-2 rounded-full bg-[#eb483f] group-hover:bg-white animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Elite Coach</span>
        </div>

        {/* Level Badge */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-[9px] font-black text-white uppercase tracking-wider">{batch.level}</span>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-white/80 tracking-wide">4.9 • 120 Reviews</span>
          </div>
          <h3 className="text-2xl font-black text-white font-display tracking-tight leading-none">{batch.coachName}</h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
              <Clock size={12} className="text-[#eb483f]" />
              Timing
            </div>
            <p className="text-sm font-bold text-slate-700">{batch.timing}</p>
          </div>
          <div className="flex-1 space-y-1 text-right">
            <div className="flex items-center justify-end gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
              <Users size={12} className="text-blue-500" />
              Batch Info
            </div>
            <p className="text-sm font-bold text-slate-700">{batch.days}</p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Availability</span>
              <span className="text-[13px] font-black text-slate-800">{totalSeats - filledSeats} Slots Left</span>
            </div>
            <span className="text-[11px] font-black text-[#eb483f] bg-[#eb483f]/10 px-2 py-1 rounded-lg">
              {Math.round(seatPercent)}% Full
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner flex p-0.5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${seatPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#eb483f] to-[#ff6b6b] shadow-[0_0_10px_rgba(235,72,63,0.3)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">Monthly Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-display text-[#0F172A]">₹{batch.fees}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">/ Month</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/coaching-summary', { state: { batch } })}
            className="flex items-center gap-3 bg-[#eb483f] text-white pl-6 pr-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#eb483f]/25 transition-all group/btn"
          >
            Join Class
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover/btn:bg-white/40 transition-colors">
               <ChevronRight size={16} />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachCard;
