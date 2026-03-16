import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CourtIcon, StadiumIcon, ShuttleCalendarIcon, RacketIcon, PlayerAvatarIcon } from '../modules/user/components/BadmintonIcons';
import { useTheme } from '../modules/user/context/ThemeContext';
import Header from '../modules/user/components/Header';
import { Calendar, Plus } from 'lucide-react';

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const isProfilePage = location.pathname.startsWith('/profile');
  const isArenaPage = location.pathname.startsWith('/arenas') || location.pathname.startsWith('/book');

  const navItems = [
    { path: '/', label: 'Home', icon: CourtIcon },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/bookings', label: 'Bookings', icon: ShuttleCalendarIcon },
    { path: '/coaching', label: 'Coaching', icon: RacketIcon },
  ];

  return (
    <div className={`flex flex-col min-h-screen relative overflow-x-hidden transition-colors duration-500 bg-[#FFF1F1]`}>

      {/* Global Header - Sticky on Desktop (except profile) */}
      {!isProfilePage && (
        <div className="hidden md:block md:sticky md:top-0 md:z-[100]">
          <Header />
        </div>
      )}

      {/* Court line pattern background */}
      <div className="fixed inset-0 court-lines opacity-10 pointer-events-none z-0" />

      {/* Scrollable Content */}
      <main className="flex-1 relative z-10 w-full min-h-screen">
        <div key={location.pathname}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on Desktop (md:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
        {/* Top glow line */}
        <div className={`h-[1px] bg-gradient-to-r from-transparent via-[#eb483f]/20 to-transparent`} />

        <div className={`backdrop-blur-xl px-2 pt-1 pb-2 flex justify-around items-center transition-colors duration-500 bg-white/80 border-t border-[#eb483f]/10 shadow-[0_-4px_20px_rgba(235, 72, 63,0.05)]`}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className="relative flex flex-col items-center justify-center group flex-1"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute -top-3 w-8 h-1 rounded-full bg-[#eb483f] shadow-[0_0_10px_rgba(235, 72, 63,0.5)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive
                      ? 'text-[#eb483f]'
                      : 'text-slate-400 group-hover:text-[#eb483f]/70'
                      }`}>
                      <Icon size={22} />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5 transition-colors duration-300 ${isActive
                      ? 'text-[#eb483f]'
                      : 'text-slate-400 group-hover:text-[#eb483f]/70'
                      }`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );

            // Inject the floating + button right in the center (after index 1)
            if (index === 2) {
              return [
                <button
                  key="action-btn"
                  onClick={() => navigate('/arenas')}
                  className={`relative -top-4 flex flex-col items-center justify-center group z-10 active:scale-95 transition-all w-16 ${isArenaPage ? 'scale-110' : ''}`}
                >
                  <div className={`bg-[#eb483f] w-[50px] h-[50px] rounded-full flex items-center justify-center text-white border-[4px] border-white transition-all duration-300 ${isArenaPage
                    ? 'shadow-[0_0_25px_rgba(235,72,63,0.6)] ring-2 ring-[#eb483f]/20'
                    : 'shadow-[0_8px_20px_rgba(235,72,63,0.4)]'
                    }`}>
                    <Plus size={26} strokeWidth={3} className={`transition-transform duration-500 ${isArenaPage ? 'rotate-90' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-5 transition-colors duration-300 ${isArenaPage ? 'text-[#eb483f]' : 'text-[#eb483f]/60'}`}>
                    Book
                  </span>
                </button>,
                content
              ];
            }

            return content;
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserLayout;
