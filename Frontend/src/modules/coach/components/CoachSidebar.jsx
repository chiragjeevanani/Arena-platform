import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, ClipboardCheck,
  ChevronLeft, ChevronRight, CalendarDays, TrendingUp, LayoutDashboard,
  Layers
} from 'lucide-react';
import Logo from '../../../assets/Logo (3).png';
import { useTheme } from '../../user/context/ThemeContext';

const SIDEBAR_STRUCTURE = [
  {
    group: "Main",
    items: [
      { path: '/coach', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/coach/schedule', icon: CalendarDays, label: 'Calendar' },
      { path: '/coach/batches', icon: Layers, label: 'Batches' },
      { path: '/coach/students', icon: Users, label: 'Students' },
      { path: '/coach/attendance', icon: ClipboardCheck, label: 'Attendance' },
      { path: '/coach/progress', icon: TrendingUp, label: 'Progress' },
    ]
  }
];

const CoachSidebar = ({ isCollapsed, setIsCollapsed, onMobileClose }) => {
  const { isDark } = useTheme();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className={`h-full md:h-screen sticky top-0 flex flex-col z-[100] relative shadow-lg ${
        isDark ? 'bg-[#0f1115] border-r border-white/5' : 'bg-[#E8EDF2]'
      }`}
    >
      {/* Header */}
      <div className={`h-20 border-b flex items-center justify-center px-6 shrink-0 transition-all duration-300 relative z-20 ${
        isDark ? 'border-white/5' : 'border-[#D9E2EC]'
      }`}>
        <div className={`shrink-0 flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20 scale-125'}`}>
          <img src={Logo} alt="AMM Sports" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Right Vertical Border */}
      {!isDark && (
        <div className="absolute right-0 top-20 bottom-0 w-[1px] bg-[#D9E2EC] pointer-events-none z-10" />
      )}

      {/* Collapse Button (floating) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-28 -right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-[110] shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${
          isDark 
            ? 'bg-[#1a1d24] border border-white/10 text-[#CE2029] hover:bg-[#CE2029] hover:text-white' 
            : 'bg-white border border-[#D9E2EC] text-[#CE2029] hover:bg-[#CE2029] hover:text-white'
        }`}
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-32 space-y-1 scrollbar-hide shrink-0 relative z-20">
        {SIDEBAR_STRUCTURE.map((section, idx) => (
          <div key={section.group} className="space-y-0.5">
            {idx > 0 && <div className="h-2" />}
            <div className="space-y-1 px-3">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/coach'}
                  onClick={() => onMobileClose?.()}
                  className={({ isActive }) =>
                    `relative flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all duration-300 group overflow-hidden ${
                      isActive 
                        ? `bg-[#CE2029] text-white shadow-md shadow-[#CE2029]/30 font-bold` 
                        : `${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-[#36454F] hover:bg-white/60 hover:text-[#CE2029]'} font-semibold`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`shrink-0 transition-all duration-300 ${
                          isActive ? 'text-white' : `${isDark ? 'text-white/40' : 'text-[#36454F]'} group-hover:text-[#CE2029]`
                        }`}
                      />
                      <AnimatePresence mode="popLayout">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="whitespace-nowrap tracking-wide text-[13px]"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Background Image at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 z-10 pointer-events-none overflow-hidden rounded-br-2xl md:rounded-b-none">
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isDark ? 'from-[#0f1115]' : 'from-black/80'}`} />
        <img 
          src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600&auto=format&fit=crop" 
          alt="Badminton Arena" 
          className="w-full h-full object-cover"
        />
      </div>

    </motion.aside>
  );
};

export default CoachSidebar;
