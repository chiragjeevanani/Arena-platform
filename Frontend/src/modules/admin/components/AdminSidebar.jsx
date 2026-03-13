import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Shield, MapPin, 
  Target, CalendarClock, Receipt, Trophy,
  Star, Package, CreditCard, PieChart,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { ShuttlecockIcon } from '../../user/components/BadmintonIcons';
import { useTheme } from '../../user/context/ThemeContext';

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
  { path: '/admin/users', icon: Users, label: 'User Management' },
  { path: '/admin/arenas', icon: MapPin, label: 'Arena Management' },
  { path: '/admin/courts', icon: Target, label: 'Court Management' },
  { path: '/admin/slots', icon: CalendarClock, label: 'Slot Schedule' },
  { path: '/admin/bookings', icon: Receipt, label: 'Bookings' },
  { path: '/admin/coaching', icon: Star, label: 'Coaching' },
  { path: '/admin/events', icon: Trophy, label: 'Events & Tournaments' },
  { path: '/admin/sponsorships', icon: Target, label: 'Sponsorships' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/pos', icon: CreditCard, label: 'Retail POS' },
  { path: '/admin/reports', icon: PieChart, label: 'Financial Reports' },
];

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { isDark } = useTheme();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className={`h-screen sticky top-0 backdrop-blur-3xl border-r flex flex-col z-[100] overflow-visible relative ${
        isDark ? 'bg-[#0A1F44]/50 border-[#22FF88]/10' : 'bg-white/80 border-[#0A1F44]/10'
      }`}
    >
      <div className={`absolute inset-0 transition-opacity duration-500 -z-10 ${
        isDark ? 'bg-gradient-to-b from-[#08142B]/80 to-[#0A1F44]/80' : 'bg-gradient-to-b from-white/95 to-white/80'
      }`} />
      <div className="absolute inset-0 court-lines opacity-10 pointer-events-none -z-10" />

      {/* Header */}
      <div className={`h-20 flex items-center justify-between px-6 border-b shrink-0 ${
        isDark ? 'border-[#22FF88]/10' : 'border-[#0A1F44]/10'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-8 h-8 rounded-xl bg-[#22FF88]/10 border border-[#22FF88]/20 flex items-center justify-center">
            <ShuttlecockIcon size={18} className="text-[#22FF88]" />
          </div>
          <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`whitespace-nowrap font-bold font-display tracking-wide ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
              >
                ARENA<span className="text-[#22FF88]">CRM</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Button (floating) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-24 -right-3 w-6 h-6 bg-[#1EE7FF]/10 border border-[#1EE7FF]/30 rounded-full flex items-center justify-center text-[#1EE7FF] hover:bg-[#1EE7FF] hover:text-[#08142B] transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scrollbar-hide shrink-0">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'} // strict match for dashboard
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? `bg-gradient-to-r ${isDark ? 'from-[#22FF88]/20' : 'from-[#22FF88]/10'} to-transparent text-[#22FF88]` 
                  : `${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-[#0A1F44]/60 hover:bg-[#0A1F44]/5 hover:text-[#0A1F44]'}`
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#22FF88] rounded-r-full shadow-[0_0_10px_#22FF88]"
                  />
                )}
                <item.icon
                  size={20}
                  className={`shrink-0 transition-all duration-300 ${
                    isActive ? 'text-[#22FF88]' : 'group-hover:text-[#1EE7FF]'
                  }`}
                />
                <AnimatePresence mode="popLayout">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap font-semibold text-sm tracking-wide"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Quick Info - optional */}
    </motion.aside>
  );
};

export default AdminSidebar;
