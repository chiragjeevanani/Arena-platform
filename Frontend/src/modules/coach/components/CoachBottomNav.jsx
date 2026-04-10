import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, Users, ClipboardCheck, 
  TrendingUp, LayoutDashboard, Layers 
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const NAV_ITEMS = [
  { path: '/coach', icon: LayoutDashboard, label: 'Home' },
  { path: '/coach/schedule', icon: CalendarDays, label: 'Schedule' },
  { path: '/coach/batches', icon: Layers, label: 'Batches' },
  { path: '/coach/students', icon: Users, label: 'Students' },
  { path: '/coach/attendance', icon: ClipboardCheck, label: 'Records' },
  { path: '/coach/progress', icon: TrendingUp, label: 'Stats' },
];

const CoachBottomNav = () => {
  const { isDark } = useTheme();

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t backdrop-blur-xl transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0f1115]/90 border-white/5 shadow-[0_-8px_30px_rgb(0,0,0,0.4)]' 
        : 'bg-white/90 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
    }`}>
      <div className="flex items-center justify-around px-1 py-2.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/coach'}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 min-w-[50px] transition-all duration-300 ${
                isActive 
                  ? 'text-[#CE2029]' 
                  : isDark ? 'text-white/80' : 'text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -2 : 0
                  }}
                  className={`relative p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-[#CE2029]/10' : ''
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                
                <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-100 scale-100 font-black'
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#CE2029]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default CoachBottomNav;
