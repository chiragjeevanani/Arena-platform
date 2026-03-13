import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';

/**
 * ScoreboardSearch — Scoreboard-styled search bar with glass blur
 */
const ScoreboardSearch = ({ onSearch, placeholder = 'Search arenas, sports...' }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();
  const filterRef = useRef(null);

  const handleFilterClick = () => {
    if (filterRef.current) {
      gsap.to(filterRef.current, {
        rotation: 90,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.to(filterRef.current, { rotation: 0, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
        }
      });
    }
  };

  return (
    <div className="flex space-x-3">
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 20px rgba(34, 255, 136, 0.15), inset 0 0 20px rgba(34, 255, 136, 0.03)'
            : '0 0 0px transparent'
        }}
        className={`
          relative flex-1 ${isDark ? 'bg-white/5' : 'bg-white/10'} backdrop-blur-md md:rounded-none rounded-2xl transition-all duration-300
          ${isFocused ? 'border-[#22FF88]' : (isDark ? 'border-white/30' : 'border-white/40')}
          border border-solid
        `}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); onSearch?.(e.target.value); }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full bg-transparent md:rounded-none rounded-2xl py-3 pl-5 pr-12 text-sm font-medium focus:outline-none focus:ring-0 border-none ${isDark
              ? 'text-white/90 placeholder:text-white/40'
              : 'text-white placeholder:text-white/60'
            }`}
        />
        <Search
          size={16}
          className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-[#22FF88]' : (isDark ? 'text-white/60' : 'text-white/80')}`}
        />
      </motion.div>

      {/* Filter Button — Tournament Control Knob */}
      <button
        onClick={handleFilterClick}
        className={`w-12 h-12 ${isDark ? 'bg-white/5' : 'bg-white/10'} backdrop-blur-md md:rounded-none rounded-xl flex items-center justify-center border border-solid ${isDark ? 'border-white/30' : 'border-white/40'} hover:border-[#22FF88] transition-all duration-300 group`}
      >
        <div ref={filterRef}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={`${isDark ? 'text-white/50' : 'text-white/80'} group-hover:text-[#22FF88] transition-colors`}>
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="2" fill="currentColor" />
            <line x1="10" y1="3" x2="10" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="15" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="10" x2="5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default ScoreboardSearch;
