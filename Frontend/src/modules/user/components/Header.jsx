import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, LogIn } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShuttlecockIcon, PlayerAvatarIcon, CourtIcon, StadiumIcon, ShuttleCalendarIcon, RacketIcon } from './BadmintonIcons';
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

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/book/1/1', label: 'Book' },
    { path: '/bookings', label: 'Bookings' },
    { path: '/coaching', label: 'Coaching' },
    { path: '/membership', label: 'Membership' },
  ];


  return (
    <header className={`relative px-6 pt-2 pb-2 md:pt-3 md:pb-3 overflow-hidden transition-all duration-500 z-[100] ${
      'bg-[#eb483f] shadow-[0_10px_30px_rgba(235, 72, 63, 0.15)]'
    }`}>
      {/* Stadium light streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={lightRef1}
          className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-[#eb483f]/20 to-transparent -skew-x-12"
        />
        <div
          ref={lightRef2}
          className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-[#eb483f]/15 to-transparent skew-x-12"
        />
      </div>

      {/* Background court pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <line x1="200" y1="0" x2="200" y2="200" stroke="#eb483f" strokeWidth="0.5" opacity="0.1" />
          <rect x="50" y="20" width="300" height="160" rx="4" fill="none" stroke="#eb483f" strokeWidth="0.3" opacity="0.08" />
          <line x1="50" y1="100" x2="350" y2="100" stroke="#eb483f" strokeWidth="0.3" opacity="0.05" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10 w-full px-2">
        {/* Main Header Row â€” Grid for Perfect Centering */}
        <div className="grid grid-cols-3 items-center w-full h-10 md:h-12">
          
          {/* 1. Left Corner: Logo */}
          <div className="flex justify-start">
            <div 
              className="flex items-center gap-2 cursor-pointer ml-[3px] shrink-0 px-1" 
              onClick={() => navigate('/')}
            >
              <ShuttlecockIcon size={24} className="text-[#eb483f] md:text-white" />
              <span className="hidden sm:inline text-lg md:text-xl font-black tracking-tight uppercase italic font-display text-white">
                AmmSportsArena
              </span>
              <span className="sm:hidden text-lg font-black tracking-tight uppercase italic font-display text-white">
                ASA
              </span>
            </div>
          </div>

          {/* 2. Center: Navigation (Desktop) / Search (Mobile) */}
          <div className="flex justify-center w-full">
            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `
                    text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative py-1
                    ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}
                  `}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div 
                      layoutId="headerNavUnderline"
                      className="absolute -bottom-1 inset-x-0 h-1 bg-white rounded-full"
                    />
                  )}
                </NavLink>
              ))}
            </div>

            {/* Mobile Search Bar - Kept for mobile flow */}
            <div className="md:hidden w-full max-w-[180px]">
              <ScoreboardSearch placeholder="Search..." />
            </div>
          </div>

          {/* 3. Right Corner: Theme, Notification & Auth */}
          <div className="flex justify-end pr-[3px]">
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* Notification Bell */}
              <button
                onClick={() => navigate('/profile/notifications')}
                className="relative w-8 h-8 md:w-9 md:h-9 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 hover:border-[#eb483f]/40 transition-all group"
                title="Notifications"
              >
                <Bell size={16} className="text-white/60 group-hover:text-white transition-colors" />
                <div className="absolute top-2 right-2 md:right-2.5 w-1.5 h-1.5 bg-[#eb483f] rounded-full shadow-[0_0_5px_rgba(235, 72, 63,0.5)]" />
              </button>

              {!isLoggedIn ? (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 md:px-5 h-8 md:h-9 bg-[#eb483f] text-[#eb483f] font-bold text-[10px] md:text-[11px] uppercase tracking-wider rounded-xl hover:bg-[#1de97b] transition-all flex items-center gap-2 shadow-lg active:scale-95 ml-1"
                >
                  <LogIn size={14} strokeWidth={3} />
                  <span className="hidden lg:inline whitespace-nowrap">Login</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-8 h-8 md:w-9 md:h-9 bg-white/5 text-white/60 rounded-xl flex items-center justify-center border border-white/20 hover:border-white/40 hover:text-white transition-all active:scale-95 group ml-1"
                  title="My Profile"
                >
                  <PlayerAvatarIcon size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* This extra nav row is now hidden on desktop to save height */}
        <div className="md:hidden mt-4 flex justify-center">
          <DesktopNavbar />
        </div>
      </div>
    </header>
  );
};

export default Header;



