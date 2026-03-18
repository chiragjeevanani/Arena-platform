import { motion } from 'framer-motion';
import { Clock, Users, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * CoachCard — Coaching batch card with progress meter and sporty styling (compacted)
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className={`rounded-[20px] overflow-hidden group transition-all duration-400 border relative ${
        isDark 
          ? 'glass-card border-white/10 bg-white/5 hover:border-[#eb483f]/40 shadow-xl shadow-black/20' 
          : 'bg-white border-slate-100 shadow-md shadow-slate-200/40 hover:shadow-lg hover:shadow-[#eb483f]/10 translate-y-0 hover:-translate-y-1'
      }`}
    >
      {/* Hero Section */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={batch.image}
          alt={batch.coachName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Soft Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Pro Badge */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 group-hover:bg-[#eb483f] group-hover:border-[#eb483f] transition-all duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f] group-hover:bg-white animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">Elite Coach</span>
        </div>

        {/* Level Badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          <span className="text-[8px] font-black text-white uppercase tracking-wider">{batch.level}</span>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-white/80 tracking-wide">4.9 • 120 Reviews</span>
          </div>
          <h3 className="text-xl font-black text-white font-display tracking-tight leading-none">{batch.coachName}</h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 lg:p-5 space-y-4">
        {/* Timing and Batch Info side-by-side using flex layout to compact space */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest text-[8px] font-black">
              <Clock size={10} className="text-[#eb483f]" />
              Timing
            </div>
            <p className="text-xs font-bold text-slate-700">{batch.timing}</p>
          </div>
          <div className="flex-1 space-y-0.5 text-right">
            <div className="flex items-center justify-end gap-1.5 text-slate-400 uppercase tracking-widest text-[8px] font-black">
               Batch Info
              <Users size={10} className="text-blue-500" />
            </div>
            <p className="text-xs font-bold text-slate-700">{batch.days}</p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Availability</span>
              <span className="text-[11px] font-black text-slate-800">{totalSeats - filledSeats} Slots Left</span>
            </div>
            <span className="text-[9px] font-black text-[#eb483f] bg-[#eb483f]/10 px-2 py-0.5 rounded-md">
              {Math.round(seatPercent)}% Full
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner flex p-px">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${seatPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#eb483f] to-[#ff6b6b] shadow-[0_0_5px_rgba(235,72,63,0.3)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">Monthly Fee</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl lg:text-2xl font-black font-display text-[#0F172A]">₹{batch.fees}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">/ Mo</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/coaching-summary', { state: { batch } })}
            className="flex items-center gap-2 bg-[#eb483f] text-white pl-4 pr-3 py-2.5 rounded-[14px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#eb483f]/20 transition-all group/btn"
          >
            Join Class
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover/btn:bg-white/40 transition-colors">
               <ChevronRight size={14} />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachCard;
