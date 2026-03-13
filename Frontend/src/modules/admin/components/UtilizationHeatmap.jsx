import { motion } from 'framer-motion';

const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6'];

const getHeatColor = (value) => {
  if (value > 80) return 'bg-[#22FF88] shadow-[0_0_10px_#22FF88]';
  if (value > 60) return 'bg-[#22FF88]/70';
  if (value > 40) return 'bg-[#22FF88]/40';
  if (value > 20) return 'bg-[#22FF88]/20';
  return 'bg-white/5';
};

const UtilizationHeatmap = () => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="min-w-[600px]">
        {/* Header row */}
        <div className="flex mb-2">
          <div className="w-16 shrink-0" />
          {hours.map((h, i) => (
            <div key={i} className="flex-1 text-center text-[10px] font-bold text-white/40 uppercase tracking-wider">
              {h}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-1.5">
          {courts.map((court, rowIdx) => (
            <div key={court} className="flex items-center">
              <div className="w-16 shrink-0 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                {court}
              </div>
              <div className="flex-1 flex gap-1.5">
                {hours.map((_, colIdx) => {
                  // random utilization % 0-100
                  const utilization = Math.floor(Math.random() * 100);
                  return (
                    <div key={colIdx} className="flex-1 group relative">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (rowIdx * 0.05) + (colIdx * 0.05) }}
                        className={`h-6 rounded hover:ring-1 hover:ring-white/50 cursor-pointer transition-colors ${getHeatColor(utilization)}`}
                      />
                      {/* Tooltip */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 -translate-y-2 pointer-events-none bg-[#08142B] border border-white/20 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 transition-opacity">
                        {utilization}% Booked
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UtilizationHeatmap;
