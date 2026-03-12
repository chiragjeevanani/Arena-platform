import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CourtIcon, StadiumIcon, ShuttleCalendarIcon, RacketIcon, PlayerAvatarIcon } from '../modules/user/components/BadmintonIcons';
import { useTheme } from '../modules/user/context/ThemeContext';

const UserLayout = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  const navItems = [
    { path: '/', label: 'Home', icon: CourtIcon },
    { path: '/arenas', label: 'Arenas', icon: StadiumIcon },
    { path: '/bookings', label: 'Bookings', icon: ShuttleCalendarIcon },
    { path: '/coaching', label: 'Coaching', icon: RacketIcon },
    { path: '/profile', label: 'Profile', icon: PlayerAvatarIcon },
  ];

  return (
    <div className={`flex flex-col min-h-screen md:max-w-[450px] md:mx-auto md:shadow-2xl relative overflow-x-hidden transition-colors duration-500 ${
      isDark
        ? 'bg-gradient-to-b from-[#08142B] to-[#0A1F44] md:ring-1 md:ring-white/5'
        : 'bg-gradient-to-b from-[#F0F4F8] to-[#E8EDF3] md:ring-1 md:ring-[#0A1F44]/5'
    }`}>
      {/* Court line pattern background */}
      <div className="fixed inset-0 court-lines pointer-events-none z-0 md:max-w-[450px] md:mx-auto" />

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:max-w-[450px] md:mx-auto">
        {/* Top glow line */}
        <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${
          isDark ? 'via-[#22FF88]/20' : 'via-[#0A1F44]/10'
        }`} />

        <div className={`backdrop-blur-xl px-2 py-3 pb-7 flex justify-around items-center transition-colors duration-500 ${
          isDark
            ? 'bg-[#08142B]/90 border-t border-white/5'
            : 'bg-white/80 border-t border-[#0A1F44]/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className="relative flex flex-col items-center justify-center group"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute -top-3 w-8 h-1 rounded-full bg-[#22FF88] shadow-[0_0_10px_rgba(34,255,136,0.5)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'text-[#22FF88]'
                        : isDark
                          ? 'text-white/30 group-hover:text-white/50'
                          : 'text-[#0A1F44]/30 group-hover:text-[#0A1F44]/50'
                    }`}>
                      <Icon size={22} />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5 transition-colors duration-300 ${
                      isActive
                        ? 'text-[#22FF88]'
                        : isDark
                          ? 'text-white/20 group-hover:text-white/40'
                          : 'text-[#0A1F44]/25 group-hover:text-[#0A1F44]/40'
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserLayout;
