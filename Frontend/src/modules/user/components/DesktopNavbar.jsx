import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CourtIcon, StadiumIcon, ShuttleCalendarIcon, RacketIcon, PlayerAvatarIcon } from './BadmintonIcons';
import { useTheme } from '../context/ThemeContext';

const DesktopNavbar = () => {
  const { isDark } = useTheme();

  const navItems = [
    { path: '/', label: 'Home', icon: CourtIcon },
    { path: '/arenas', label: 'Arenas', icon: StadiumIcon },
    { path: '/bookings', label: 'Bookings', icon: ShuttleCalendarIcon },
    { path: '/coaching', label: 'Coaching', icon: RacketIcon },
  ];

  return (
    <nav className="hidden md:flex items-center justify-center gap-6 mt-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              relative px-4 py-2 md:rounded-none rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2
              ${isActive
                ? 'text-[#eb483f] bg-[#eb483f]/10 shadow-[0_4px_15px_rgba(235, 72, 63,0.15)] border border-[#eb483f]/20'
                : 'text-white hover:text-[#eb483f] hover:bg-white/5'
              }
            `}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#eb483f] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </NavLink>
        );
      })}
    </nav>
  );
};

export default DesktopNavbar;

