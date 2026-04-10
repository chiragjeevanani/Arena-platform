import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShuttlecockIcon } from './BadmintonIcons';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * MatchBanner — Dynamic promotional banner with shuttlecock flying animation
 */
const MatchBanner = ({ promos = [] }) => {
  const [current, setCurrent] = useState(0);
  const [desktopCurrent, setDesktopCurrent] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize desktop index safely in the middle block
  useEffect(() => {
    if (promos.length > 0 && desktopCurrent === 0) {
      setDesktopCurrent(promos.length);
    }
  }, [promos.length]);

  useEffect(() => {
    if (promos.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      if (window.innerWidth < 768) {
        setCurrent((prev) => (prev >= promos.length - 1 ? 0 : prev + 1));
      } else {
        setDesktopCurrent((prev) => prev + 1);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [promos.length, isHovered]);

  const prevDesktop = () => setDesktopCurrent((prev) => prev - 1);
  const nextDesktop = () => setDesktopCurrent((prev) => prev + 1);

  const handleDesktopAnimationComplete = () => {
    if (promos.length === 0) return;
    if (desktopCurrent >= promos.length * 2) {
      setIsSnapping(true);
      setDesktopCurrent(desktopCurrent - promos.length);
    } else if (desktopCurrent <= 0) {
      setIsSnapping(true);
      setDesktopCurrent(desktopCurrent + promos.length);
    }
  };

  useEffect(() => {
    if (isSnapping) {
      const snapTimer = setTimeout(() => setIsSnapping(false), 50);
      return () => clearTimeout(snapTimer);
    }
  }, [isSnapping]);

  if (!promos.length) return null;

  const desktopPromos = [...promos, ...promos, ...promos];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Mobile View ── */}
      {/*
        All slides are stacked absolutely on top of each other.
        The CURRENT slide fades in on top — the previous one stays visible underneath.
        This means there is NEVER a blank background visible during transitions.
      */}
      <div className="md:hidden relative h-52 overflow-hidden">
        {promos.map((promo, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            animate={{ opacity: index === current ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ zIndex: index === current ? 2 : 1 }}
          >
            <img
              src={promo.image}
              alt="Promo"
              className="w-full h-full object-cover"
              // Eager loading so browser prioritises these immediately
              loading="eager"
              decoding="sync"
            />
            <div className="absolute inset-0 p-5 flex flex-col justify-center">
              <p className="text-[#fffdd0] text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">
                {promo.subtitle || '🏸 Featured'}
              </p>
              <h2 className="text-white text-xl font-black max-w-[200px] leading-tight font-display tracking-tight">
                {promo.title}
              </h2>
              <div className="absolute top-4 right-4 animate-float opacity-80 z-20">
                <ShuttlecockIcon size={40} className="text-[#fffdd0] drop-shadow-[0_0_15px_rgba(206, 32, 41,0.5)]" />
              </div>
              <button className="mt-3 bg-[#fffdd0] text-[#CE2029] px-5 py-2 rounded-xl font-black text-xs w-fit shadow-[0_0_20px_rgba(206, 32, 41,0.2)]">
                {promo.buttonText || 'Join Match'}
              </button>
            </div>
          </motion.div>
        ))}

        {/* Mobile Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === index ? 'w-8 bg-[#fffdd0]' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop View (3-Card Infinite Carousel) ── */}
      <div className="hidden md:block relative overflow-visible py-4">
        <div className="max-w-7xl mx-auto px-4 relative group/carousel">
          <div className="overflow-hidden p-2 -m-2">
            <motion.div
              className="flex"
              animate={{ x: `-${desktopCurrent * 33.3333}%` }}
              transition={isSnapping ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
              onAnimationComplete={handleDesktopAnimationComplete}
            >
              {desktopPromos.map((promo, index) => {
                const actualIndex = index % promos.length;
                const isVisible = index >= desktopCurrent && index <= desktopCurrent + 2;

                return (
                  <div key={`${actualIndex}-${index}`} className="min-w-[33.3333%] px-2">
                    <motion.div
                      className={`relative w-full h-[180px] rounded-[16px] overflow-hidden border transition-all duration-500 cursor-pointer group/card
                        ${isVisible ? 'border-[#fffdd0]/40 shadow-[0_15px_35px_rgba(0,0,0,0.2)]' : 'border-white/5 opacity-80'}`}
                      whileHover={{ scale: 1.02, translateY: -5 }}
                    >
                      <img
                        src={promo.image}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover/card:scale-110"
                        alt={promo.title}
                        loading="eager"
                        decoding="sync"
                      />
                      <div className="absolute inset-0" />
                      <div className="absolute top-6 right-6 animate-float opacity-0 group-hover/card:opacity-100 transition-all duration-500 z-30 pointer-events-none">
                        <ShuttlecockIcon size={40} className="text-[#fffdd0] drop-shadow-[0_0_20px_rgba(206, 32, 41,0.6)]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                        <span className="text-[#fffdd0] text-[8px] font-black uppercase tracking-[0.3em] mb-1.5 block">
                          {promo.subtitle}
                        </span>
                        <h2 className="text-white text-base font-black leading-tight font-display line-clamp-2 mb-4">
                          {promo.title}
                        </h2>
                        <div className="bg-[#fffdd0] text-[#CE2029] px-4 py-1.5 rounded-lg font-black text-[10px] w-fit uppercase tracking-wider">
                          {promo.buttonText}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 -left-6 -right-6 flex items-center justify-between pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <button
              onClick={prevDesktop}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-[#fffdd0] hover:text-[#CE2029] transition-all hover:scale-110 shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextDesktop}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-[#fffdd0] hover:text-[#CE2029] transition-all hover:scale-110 shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Desktop Indicators */}
          <div className="mt-8 flex justify-center items-center space-x-2">
            {promos.map((_, index) => {
              const activeNormalized = (desktopCurrent % promos.length + promos.length) % promos.length;
              return (
                <button
                  key={index}
                  onClick={() => setDesktopCurrent(promos.length + index)}
                  className="group py-2"
                >
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                    activeNormalized === index ? 'w-8 bg-[#fffdd0]' : 'w-4 bg-white/20 group-hover:bg-white/40'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchBanner;
