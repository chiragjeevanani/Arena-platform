import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Bell, ChevronRight, Sun, Moon } from 'lucide-react';
import { ARENAS } from '../../../data/mockData';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableTennisPaddleBall } from '@fortawesome/free-solid-svg-icons';
import ScoreboardSearch from '../components/ScoreboardSearch';
import MatchBanner from '../components/MatchBanner';
import ArenaCard from '../components/ArenaCard';
import { useTheme } from '../context/ThemeContext';

const UserHome = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef(null);
  const lightRef1 = useRef(null);
  const lightRef2 = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  const promos = [
    {
      title: "Join Tournament",
      subtitle: "30% off for new players",
      buttonText: "Join Match",
      image: "https://images.unsplash.com/photo-1626224484214-405100cd0e2c?q=80&w=800&auto=format&fit=crop",
    },
    {
      title: "Book Weekend Slots in Advance",
      subtitle: "Premium Courts Available",
      buttonText: "Book Now",
      image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=800&auto=format&fit=crop",
    },
    {
      title: "Join Professional Coaching",
      subtitle: "Learn from the best",
      buttonText: "Learn More",
      image: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=800&auto=format&fit=crop",
    }
  ];

  // Stadium light streak animation
  useEffect(() => {
    if (lightRef1.current && lightRef2.current) {
      gsap.fromTo(lightRef1.current,
        { x: '-100%', opacity: 0 },
        { x: '300%', opacity: 0.15, duration: 4, ease: 'power1.inOut', repeat: -1, repeatDelay: 2 }
      );
      gsap.fromTo(lightRef2.current,
        { x: '300%', opacity: 0 },
        { x: '-100%', opacity: 0.1, duration: 5, ease: 'power1.inOut', repeat: -1, repeatDelay: 3, delay: 2 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen pb-28">
      {/* ═══════ Hero Header with Stadium Lighting ═══════ */}
      <div ref={heroRef} className="relative px-6 pt-14 pb-8 overflow-hidden">
        {/* Stadium light streaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            ref={lightRef1}
            className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-[#22FF88]/20 to-transparent -skew-x-12"
          />
          <div
            ref={lightRef2}
            className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-[#1EE7FF]/15 to-transparent skew-x-12"
          />
        </div>

        {/* Background court pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <line x1="200" y1="0" x2="200" y2="200" stroke="#22FF88" strokeWidth="0.5" opacity="0.1" />
            <rect x="50" y="20" width="300" height="160" rx="4" fill="none" stroke="#22FF88" strokeWidth="0.3" opacity="0.08" />
            <line x1="50" y1="100" x2="350" y2="100" stroke="#22FF88" strokeWidth="0.3" opacity="0.05" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div>
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}
              >
                Good Morning
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mt-1"
              >
                <ShuttlecockIcon size={26} className={isDark ? 'text-[#22FF88]' : 'text-[#0A1F44]'} />
                <span className={`text-xl font-black tracking-tight uppercase italic font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  Badminton Arena
                </span>
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                onClick={toggleTheme}
                className={`relative w-11 h-11 glass-light rounded-2xl flex items-center justify-center border active:scale-90 transition-all duration-300 ${isDark ? 'border-white/10' : 'border-[#0A1F44]/10'}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDark ? (
                      <Sun size={18} className="text-[#FFD600]" />
                    ) : (
                      <Moon size={18} className="text-[#0A1F44]/60" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Notification Bell */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`relative w-11 h-11 glass-light rounded-2xl flex items-center justify-center border active:scale-90 transition-all duration-300 ${isDark ? 'border-white/10' : 'border-[#0A1F44]/10'}`}
              >
                <Bell size={20} className={isDark ? 'text-white/60' : 'text-[#0A1F44]/50'} />
                <div className="absolute top-2.5 right-3 w-2 h-2 bg-[#22FF88] rounded-full" />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScoreboardSearch placeholder="Search arenas, courts..." />
          </motion.div>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-2">
        {/* ═══════ Featured Banner ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MatchBanner promos={promos} />
        </motion.div>

        {/* ═══════ Categories — Sport Cards ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={`text-base font-bold mb-4 font-display ${isDark ? 'text-white/80' : 'text-[#0A1F44]/80'}`}>What do you want to book?</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Badminton Card */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              className={`relative bg-gradient-to-br from-purple-600/20 to-[#1EE7FF]/10 p-4 rounded-3xl h-40 flex flex-col items-center justify-end overflow-hidden group cursor-pointer border ${isDark ? 'border-white/10' : 'border-[#0A1F44]/8'}`}
            >
              {/* Floating shuttlecock */}
              <div className="absolute top-4 animate-float">
                <ShuttlecockIcon size={40} className="text-white/10" />
              </div>
              {/* Court line pattern */}
              <div className="absolute inset-0 court-lines opacity-20" />

              <div className="bg-[#22FF88]/10 border border-[#22FF88]/20 w-full py-2.5 text-center rounded-2xl font-bold text-[#22FF88] text-sm group-hover:bg-[#22FF88] group-hover:text-[#08142B] transition-all duration-300 relative z-10">
                Badminton
              </div>
            </motion.div>

            {/* Table Tennis Card */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              className={`relative bg-gradient-to-br from-emerald-600/20 to-[#22FF88]/10 p-4 rounded-3xl h-40 flex flex-col items-center justify-end overflow-hidden group cursor-pointer border ${isDark ? 'border-white/10' : 'border-[#0A1F44]/8'}`}
            >
              <div className="absolute top-4 animate-float" style={{ animationDelay: '1s' }}>
                <FontAwesomeIcon icon={faTableTennisPaddleBall} style={{ fontSize: 40 }} className="text-white/10" />
              </div>
              <div className="absolute inset-0 court-lines opacity-20" />

              <div className="bg-[#1EE7FF]/10 border border-[#1EE7FF]/20 w-full py-2.5 text-center rounded-2xl font-bold text-[#1EE7FF] text-sm group-hover:bg-[#1EE7FF] group-hover:text-[#08142B] transition-all duration-300 relative z-10">
                Table Tennis
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══════ Nearby Arenas ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-base font-bold font-display ${isDark ? 'text-white/80' : 'text-[#0A1F44]/80'}`}>Nearby Arenas</h3>
            <Link to="/arenas" className="text-[#22FF88] font-bold text-xs flex items-center gap-0.5 hover:gap-1.5 transition-all">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {ARENAS.map((arena, index) => (
              <ArenaCard key={arena.id} arena={arena} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserHome;
