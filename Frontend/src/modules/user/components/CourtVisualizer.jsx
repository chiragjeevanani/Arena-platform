import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * CourtVisualizer â€” Mini badminton court UI with selected court highlight
 */
const CourtVisualizer = ({ courts = [], selectedCourt, onCourtSelect }) => {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-3xl p-6 overflow-hidden relative border ${'bg-slate-50 border-slate-100'}`}>
      {/* Court lines background */}
      <div className={`absolute inset-0 court-lines ${'opacity-30'}`} />

      <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 relative z-10 ${'text-slate-500'}`}>
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
                  ? `bg-[#CE2029]/10 ${'border-[#CE2029]/60 shadow-[0_0_10px_rgba(206, 32, 41,0.2)]'}`
                  : `${isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'}`
                }
              `}
            >
              {/* Mini court graphic */}
              <div className="relative w-full aspect-[2/3] mb-2">
                <div className={`absolute inset-0 border rounded-lg transition-colors duration-300 ${
                  isSelected ? 'border-[#CE2029]/70' : `${'border-slate-400'}`
                }`} />
                <div className={`absolute left-0 right-0 top-1/2 h-[1px] transition-colors duration-300 ${
                  isSelected ? 'bg-[#CE2029]/60' : `${'bg-slate-400'}`
                }`} />
                <div className={`absolute top-0 bottom-0 left-1/2 w-[1px] transition-colors duration-300 ${
                  isSelected ? 'bg-[#CE2029]/40' : `${'bg-slate-300'}`
                }`} />

                {/* Active booking shuttle marker */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-3 h-3 rounded-full bg-[#CE2029] animate-pulse-neon shadow-[0_0_10px_#CE2029]" />
                  </motion.div>
                )}
              </div>

              <span className={`text-[10px] font-bold block text-center transition-colors ${
                isSelected ? 'text-[#CE2029]' : `${'text-[#CE2029]/60'}`
              }`}>
                {court.name.split(' ')[1]}
              </span>
              <span className={`text-[8px] font-bold block text-center mt-0.5 ${
                isSelected ? 'text-[#CE2029]/60' : `${'text-slate-400'}`
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



