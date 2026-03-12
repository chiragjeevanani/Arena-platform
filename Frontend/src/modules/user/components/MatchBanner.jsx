import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShuttlecockIcon } from './BadmintonIcons';

/**
 * MatchBanner — Dynamic promotional banner with shuttlecock flying animation
 */
const MatchBanner = ({ promos = [] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (promos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promos.length]);

  if (!promos.length) return null;

  return (
    <div className="relative h-44 rounded-[28px] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <img
            src={promos[current].image}
            alt="Promo"
            className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08142B]/80 via-[#08142B]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08142B]/40 via-transparent to-transparent pointer-events-none" />

          {/* Content */}
          <div className="absolute inset-0 p-5 flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#22FF88] text-[9px] font-black uppercase tracking-[0.2em] mb-1.5"
            >
              {promos[current].subtitle || '🏸 Featured'}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-xl font-black max-w-[200px] leading-tight font-display tracking-tight"
            >
              {promos[current].title}
            </motion.h2>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.95, rotate: -2 }}
              className="mt-3 bg-[#22FF88] text-[#08142B] px-5 py-2 rounded-xl font-black text-xs w-fit
                         shadow-[0_0_20px_rgba(34,255,136,0.2)] active:shadow-none transition-all uppercase tracking-wider"
            >
              {promos[current].buttonText || 'Join Match'}
            </motion.button>
          </div>

          {/* Flying Shuttlecock */}
          <motion.div
            initial={{ x: -40, y: 60, rotate: -30, opacity: 0 }}
            animate={{ x: 300, y: -30, rotate: 15, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4, delay: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
            className="absolute bottom-8 left-0 text-white/20"
          >
            <ShuttlecockIcon size={28} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      {promos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === index ? 'w-8 bg-[#22FF88]' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Neon border glow */}
      <div className="absolute inset-0 rounded-3xl border border-[#22FF88]/10 pointer-events-none" />
    </div>
  );
};

export default MatchBanner;
