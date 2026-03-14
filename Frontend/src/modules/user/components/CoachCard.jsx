import { motion } from 'framer-motion';
import { Clock, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * CoachCard â€” Coaching batch card with progress meter and sporty styling
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
      className={`rounded-3xl overflow-hidden group transition-all duration-500 border ${
        isDark 
          ? 'glass-card border-white/5 bg-white/5 hover:border-[#eb483f]/20 shadow-lg' 
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-[#eb483f]/30'
      }`}
    >
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={batch.image}
          alt={batch.coachName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#eb483f] via-[#eb483f]/40 to-transparent" />

        {/* Pro Badge */}
        <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-xl flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f]" />
          <span className="text-[10px] font-bold text-[#eb483f] uppercase tracking-[0.15em]">Professional</span>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white font-display">{batch.coachName}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star size={13} className="text-[#FFD600] fill-[#FFD600]" />
            <span className="text-xs text-white/60">4.9 (120 ratings)</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className={`${'bg-slate-50 border border-slate-100'} rounded-2xl p-3`}>
            <Clock size={15} className="text-[#eb483f] mb-1.5" />
            <p className={`text-[8px] font-bold uppercase tracking-[0.15em] ${'text-[#eb483f]/40'}`}>Timing</p>
            <p className={`text-xs font-bold mt-0.5 ${'text-[#eb483f]/80'}`}>{batch.timing.split(' - ')[0]}</p>
          </div>
          <div className={`${'bg-slate-50 border border-slate-100'} rounded-2xl p-3`}>
            <Users size={15} className="text-[#FFD600] mb-1.5" />
            <p className={`text-[8px] font-bold uppercase tracking-[0.15em] ${'text-[#eb483f]/40'}`}>Level</p>
            <p className={`text-xs font-bold mt-0.5 ${'text-[#eb483f]/80'}`}>{batch.level}</p>
          </div>
        </div>

        {/* Progress Meter - fitness tracker style */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${'text-[#eb483f]/40'}`}>Seats Filled</span>
            <span className="text-[10px] text-[#eb483f] font-bold">{filledSeats}/{totalSeats}</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${'bg-slate-100'}`}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${seatPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: seatPercent > 80
                  ? 'linear-gradient(90deg, #FFD600, #FF6B35)'
                  : 'linear-gradient(90deg, #eb483f, #eb483f)'
              }}
            />
          </div>
        </div>

        <p className={`text-xs leading-relaxed ${'text-[#eb483f]/50'}`}>
          {batch.days} classes. Footwork, racket handling & strategy.
        </p>

        {/* Footer */}
        <div className={`pt-4 border-t flex items-center justify-between ${'border-slate-100'}`}>
          <div>
            <p className={`text-[8px] font-bold uppercase tracking-[0.15em] ${'text-[#eb483f]/30'}`}>Fee / Month</p>
            <p className={`text-xl font-black font-display ${'text-[#eb483f]'}`}>â‚¹{batch.fees}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95, rotate: -2 }}
            onClick={() => navigate('/coaching-summary', { state: { batch } })}
            className="bg-[#eb483f] text-[#eb483f] px-6 py-3 rounded-2xl font-bold text-sm
                       shadow-[0_0_20px_rgba(235, 72, 63,0.15)] hover:shadow-[0_0_30px_rgba(235, 72, 63,0.3)]
                       transition-all duration-300"
          >
            Join Class
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachCard;



