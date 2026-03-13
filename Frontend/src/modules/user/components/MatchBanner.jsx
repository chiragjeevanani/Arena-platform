import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { ShuttlecockIcon } from './BadmintonIcons';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * MatchBanner — Dynamic promotional banner with shuttlecock flying animation
 * Updated with a high-end multi-card carousel for desktop
 */
const MatchBanner = ({ promos = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (promos.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promos.length, isHovered]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % promos.length);
  };

  if (!promos.length) return null;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 📱 Mobile View (Existing Logic) */}
      <div className="md:hidden relative h-44 rounded-[28px] overflow-hidden group">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img
              src={promos[current].image}
              alt="Promo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08142B]/80 via-[#08142B]/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 p-5 flex flex-col justify-center">
              <p className="text-[#22FF88] text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">
                {promos[current].subtitle || '🏸 Featured'}
              </p>
              <h2 className="text-white text-xl font-black max-w-[200px] leading-tight font-display tracking-tight">
                {promos[current].title}
              </h2>
              <button className="mt-3 bg-[#22FF88] text-[#08142B] px-5 py-2 rounded-xl font-black text-xs w-fit shadow-[0_0_20px_rgba(34,255,136,0.2)]">
                {promos[current].buttonText || 'Join Match'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Indicators for Mobile */}
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
      </div>

      {/* 💻 Desktop View (3-Card Carousel) */}
      <div className="hidden md:block relative overflow-visible py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="overflow-hidden">
            <motion.div 
               className="flex gap-4"
               animate={{ x: `-${current * 0}%` }} // Adjusted for static look if 3 items, or sliding if more
               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {promos.map((promo, index) => (
                <motion.div 
                  key={index}
                  className={`relative min-w-[calc(33.333%-11px)] h-48 rounded-[24px] overflow-hidden border transition-all duration-500 cursor-pointer group/card
                    ${current === index ? 'border-[#22FF88]/40 shadow-[0_15px_35px_rgba(0,0,0,0.2)]' : 'border-white/5 opacity-90'}`}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                >
                  {/* Image */}
                  <img 
                    src={promo.image} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
                    alt={promo.title}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08142B]/90 via-[#08142B]/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="text-[#22FF88] text-[8px] font-black uppercase tracking-[0.3em] mb-1 block">
                      {promo.subtitle}
                    </span>
                    <h2 className="text-white text-base font-black leading-tight font-display line-clamp-2 mb-3">
                      {promo.title}
                    </h2>
                    <div className="bg-[#22FF88] text-[#08142B] px-4 py-1.5 rounded-lg font-black text-[10px] w-fit uppercase tracking-wider">
                      {promo.buttonText}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Indicators for Desktop (Centered) */}
          <div className="mt-8 flex justify-center items-center space-x-3">
            {promos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className="group py-2"
              >
                <div className={`h-1 mx-1 rounded-full transition-all duration-500 ${
                  current === index ? 'w-10 bg-[#22FF88]' : 'w-3 bg-white/20 group-hover:bg-white/40'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchBanner;
