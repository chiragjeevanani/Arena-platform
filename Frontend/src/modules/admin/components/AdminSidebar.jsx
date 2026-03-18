import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Shield, MapPin, 
  Target, CalendarClock, Receipt, Trophy,
  Star, Package, CreditCard, PieChart,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import Logo from '../../../assets/Logo (3).png';

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
      { path: '/admin/bookings', icon: CalendarClock, label: 'Bookings' },
      { path: '/admin/pos', icon: CreditCard, label: 'POS' },
      { path: '/admin/coaching', icon: Users, label: 'Classes' },
      { path: '/admin/reports', icon: PieChart, label: 'Reports' },
      { path: '/admin/users', icon: Shield, label: 'Customers' },
      { path: '/admin/settings', icon: Star, label: 'Setting' },
    ]
  }
];

const AdminSidebar = ({ isCollapsed, setIsCollapsed, onMobileClose }) => {
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
      className={`h-full md:h-screen sticky top-0 flex flex-col z-[100] relative shadow-lg bg-[#E8EDF2]`}
    >
      {/* Header */}
      <div className={`h-20 border-b border-[#D9E2EC] flex items-center justify-center px-6 shrink-0 transition-all duration-300 relative z-20`}>
        <div className={`shrink-0 flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20 scale-125'}`}>
          <img src={Logo} alt="AMM Sports" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Right Vertical Border (Starts below the header so logo area naturally flows into topbar) */}
      <div className="absolute right-0 top-20 bottom-0 w-[1px] bg-[#D9E2EC] pointer-events-none z-10" />

      {/* Collapse Button (floating) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-28 -right-4 w-8 h-8 bg-white border border-[#D9E2EC] rounded-full flex items-center justify-center text-[#eb483f] hover:bg-[#eb483f] hover:text-white transition-colors z-[110] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-32 space-y-2 scrollbar-hide shrink-0 relative z-20">
        {filteredStructure.map((section, idx) => (
          <div key={section.group} className="space-y-1">
            {idx > 0 && <div className="h-4" />}
            <div className="space-y-1.5 px-3">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => onMobileClose?.()}
                  className={({ isActive }) =>
                    `relative flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all duration-300 group overflow-hidden ${
                      isActive 
                        ? `bg-[#eb483f] text-white shadow-md shadow-[#eb483f]/30 font-bold` 
                        : `text-[#243B53] hover:bg-white/60 hover:text-[#0A1F44] font-semibold`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`shrink-0 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-[#627D98] group-hover:text-[#eb483f]'
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <img 
          src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600&auto=format&fit=crop" 
          alt="Badminton Arena" 
          className="w-full h-full object-cover"
        />
      </div>

    </motion.aside>
  );
};

export default AdminSidebar;
