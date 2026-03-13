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
import { useAuth } from '../../user/context/AuthContext';

const SIDEBAR_STRUCTURE = [
  {
    group: "Overview",
    roles: ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST'],
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    group: "Operations",
    roles: ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST'],
    items: [
      { path: '/admin/arenas', icon: MapPin, label: 'Arenas', roles: ['SUPER_ADMIN'] },
      { path: '/admin/courts', icon: Target, label: 'Courts' },
      { path: '/admin/slots', icon: CalendarClock, label: 'Slot Schedule' },
      { path: '/admin/bookings', icon: Receipt, label: 'Bookings' },
      { path: '/admin/coaching', icon: Star, label: 'Coaching' },
    ]
  },
  {
    group: "Business",
    roles: ['SUPER_ADMIN', 'ARENA_ADMIN'],
    items: [
      { path: '/admin/events', icon: Trophy, label: 'Events' },
      { path: '/admin/sponsorships', icon: Target, label: 'Sponsorships' },
      { path: '/admin/pos', icon: CreditCard, label: 'Retail POS' },
      { path: '/admin/inventory', icon: Package, label: 'Inventory' },
    ]
  },
  {
    group: "Finance",
    roles: ['SUPER_ADMIN'],
    items: [
      { path: '/admin/reports', icon: PieChart, label: 'Reports' },
    ]
  },
  {
    group: "System",
    roles: ['SUPER_ADMIN'],
    items: [
      { path: '/admin/users', icon: Users, label: 'Users' },
      { path: '/admin/roles', icon: Shield, label: 'Roles' },
      { path: '/admin/settings', icon: Star, label: 'Settings' },
    ]
  }
];

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const filteredStructure = SIDEBAR_STRUCTURE.filter(section => 
    section.roles.includes(user?.role)
  ).map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || item.roles.includes(user?.role))
  })).filter(section => section.items.length > 0);

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
        className="absolute top-24 -right-3 w-6 h-6 bg-[#1EE7FF]/10 border border-[#1EE7FF]/30 rounded-full flex items-center justify-center text-[#1EE7FF] hover:bg-[#1EE7FF] hover:text-[#08142B] transition-colors z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-hide shrink-0">
        {filteredStructure.map((section) => (
          <div key={section.group} className="space-y-1">
            {!isCollapsed && (
              <motion.h4 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`px-3 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                  isDark ? 'text-white/20' : 'text-[#0A1F44]/20'
                }`}
              >
                {section.group}
              </motion.h4>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? `bg-[#22FF88]/10 text-[#22FF88]` 
                        : `${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-[#0A1F44]/60 hover:bg-[#0A1F44]/5 hover:text-[#0A1F44]'}`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-[-4px] top-2 bottom-2 w-1.5 bg-[#22FF88] rounded-full shadow-[0_0_15px_rgba(34,255,136,0.5)]"
                        />
                      )}
                      <item.icon
                        size={18}
                        className={`shrink-0 transition-all duration-300 ${
                          isActive ? 'text-[#22FF88]' : 'group-hover:text-[#22FF88]'
                        }`}
                      />
                      <AnimatePresence mode="popLayout">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="whitespace-nowrap font-bold text-xs tracking-tight"
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

      {/* Profile Section */}
      <div className={`p-4 border-t ${isDark ? 'border-[#22FF88]/10' : 'border-[#0A1F44]/10'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
          <img src={user?.avatar} className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22FF88] to-[#1EE7FF] shrink-0 object-cover" />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{user?.name}</p>
              <p className="text-[9px] text-[#22FF88] font-black uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
