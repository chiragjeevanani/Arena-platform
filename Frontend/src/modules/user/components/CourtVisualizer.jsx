import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * CourtVisualizer — Mini badminton court UI with selected court highlight
 */
const CourtVisualizer = ({ courts = [], selectedCourt, onCourtSelect }) => {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-3xl p-6 overflow-hidden relative border ${isDark ? 'glass-card border-white/5' : 'bg-slate-50 border-slate-100'}`}>
      {/* Court lines background */}
      <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-30' : 'opacity-10'}`} />

      <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 relative z-10 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
        Court Layout
      </h3>

      <div className="relative z-10 grid grid-cols-3 gap-3">
        {courts.map((court) => {
          const isSelected = selectedCourt === court.id;
          return (
            <motion.button
              key={court.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => onCourtSelect?.(court.id)}
              className={`
                relative p-3 rounded-2xl border transition-all duration-300
                ${isSelected
                  ? `bg-[#22FF88]/10 ${isDark ? 'border-[#22FF88]/40 neon-glow' : 'border-[#22FF88]/50 shadow-[0_0_10px_rgba(34,255,136,0.2)]'}`
                  : `${isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`
                }
              `}
            >
              {/* Mini court graphic */}
              <div className="relative w-full aspect-[2/3] mb-2">
                <div className={`absolute inset-0 border rounded-lg transition-colors duration-300 ${
                  isSelected ? 'border-[#22FF88]/30' : `${isDark ? 'border-white/10' : 'border-slate-200'}`
                }`} />
                <div className={`absolute left-0 right-0 top-1/2 h-[1px] transition-colors duration-300 ${
                  isSelected ? 'bg-[#22FF88]/30' : `${isDark ? 'bg-white/10' : 'bg-slate-100'}`
                }`} />
                <div className={`absolute top-0 bottom-0 left-1/2 w-[1px] transition-colors duration-300 ${
                  isSelected ? 'bg-[#22FF88]/20' : `${isDark ? 'bg-white/5' : 'bg-slate-50'}`
                }`} />

                {/* Active booking shuttle marker */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-3 h-3 rounded-full bg-[#22FF88] animate-pulse-neon shadow-[0_0_10px_#22FF88]" />
                  </motion.div>
                )}
              </div>

              <span className={`text-[10px] font-bold block text-center transition-colors ${
                isSelected ? 'text-[#22FF88]' : `${isDark ? 'text-white/40' : 'text-[#0A1F44]/60'}`
              }`}>
                {court.name.split(' ')[1]}
              </span>
              <span className={`text-[8px] font-bold block text-center mt-0.5 ${
                isSelected ? 'text-[#22FF88]/60' : `${isDark ? 'text-white/20' : 'text-slate-400'}`
              }`}>
                {court.type}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CourtVisualizer;
