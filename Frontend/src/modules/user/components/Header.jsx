import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, LogIn } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShuttlecockIcon, PlayerAvatarIcon } from './BadmintonIcons';
import ScoreboardSearch from './ScoreboardSearch';
import DesktopNavbar from './DesktopNavbar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { isLoggedIn } = useAuth();
  const lightRef1 = useRef(null);
  const lightRef2 = useRef(null);

  const isHome = location.pathname === '/';

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
    <header className={`relative px-6 pt-4 pb-4 overflow-hidden transition-all duration-500 z-[100] ${
      isDark ? 'bg-[#08142B]' : 'bg-[#0A1F44] shadow-[0_10px_30px_rgba(10,31,68,0.15)]'
    }`}>
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
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <line x1="200" y1="0" x2="200" y2="200" stroke="#22FF88" strokeWidth="0.5" opacity="0.1" />
          <rect x="50" y="20" width="300" height="160" rx="4" fill="none" stroke="#22FF88" strokeWidth="0.3" opacity="0.08" />
          <line x1="50" y1="100" x2="350" y2="100" stroke="#22FF88" strokeWidth="0.3" opacity="0.05" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10 w-full px-2">
        {/* Main Header Row — Grid for Perfect Centering */}
        <div className="grid grid-cols-3 items-center w-full h-12">
          
          {/* 1. Left Corner: Logo */}
          <div className="flex justify-start">
            <div 
              className="flex items-center gap-2 cursor-pointer ml-[3px] shrink-0 px-1" 
              onClick={() => navigate('/')}
            >
              <ShuttlecockIcon size={24} className="text-[#22FF88]" />
              <span className="hidden sm:inline text-lg md:text-xl font-black tracking-tight uppercase italic font-display text-white">
                Badminton Arena
              </span>
            </div>
          </div>

          {/* 2. Center: Search Bar */}
          <div className="flex justify-center w-full">
            <div className="w-full max-w-md">
              <ScoreboardSearch placeholder="Search arenas, courts..." />
            </div>
          </div>

          {/* 3. Right Corner: Theme, Notification & Auth */}
          <div className="flex justify-end pr-[3px]">
            <div className="flex items-center gap-3 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 bg-white/5 backdrop-blur-sm md:rounded-xl rounded-xl flex items-center justify-center border border-white/20 hover:border-[#22FF88]/40 transition-all group"
                title="Toggle Theme"
              >
                {isDark ? <Sun size={17} className="text-[#FFD600] group-hover:scale-110 transition-transform" /> : <Moon size={17} className="text-[#1EE7FF] group-hover:scale-110 transition-transform" />}
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => navigate('/profile/notifications')}
                className="relative w-9 h-9 bg-white/5 backdrop-blur-sm md:rounded-xl rounded-xl flex items-center justify-center border border-white/20 hover:border-[#22FF88]/40 transition-all group"
                title="Notifications"
              >
                <Bell size={17} className="text-white/60 group-hover:text-white transition-colors" />
                <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#22FF88] rounded-full shadow-[0_0_5px_rgba(34,255,136,0.5)]" />
              </button>

              {!isLoggedIn ? (
                /* Login / Sign Up Button - Shown when NOT logged in */
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 h-9 bg-[#22FF88] text-[#0A1F44] font-bold text-[11px] uppercase tracking-wider md:rounded-xl rounded-xl hover:bg-[#1de97b] transition-all flex items-center gap-2 shadow-lg shadow-[#22FF88]/20 active:scale-95 ml-1"
                >
                  <LogIn size={15} strokeWidth={3} />
                  <span className="hidden lg:inline whitespace-nowrap">Login/Sign Up</span>
                </button>
              ) : (
                /* Profile Icon Button - Shown ONLY when logged in */
                <button
                  onClick={() => navigate('/profile')}
                  className="w-9 h-9 bg-white/5 text-white/60 md:rounded-xl rounded-xl flex items-center justify-center border border-white/20 hover:border-[#22FF88]/40 hover:text-[#22FF88] transition-all active:scale-95 group ml-1"
                  title="My Profile"
                >
                  <PlayerAvatarIcon size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nav Row */}
        <div className="mt-4 md:mt-3 flex justify-center">
          <DesktopNavbar />
        </div>
      </div>
    </header>
  );
};

export default Header;
