import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Shield, MapPin, 
  Target, CalendarClock, Receipt, Trophy,
  Settings, Package, CreditCard, PieChart,
  ChevronLeft, ChevronRight, DollarSign,
  Building2, Clock, CalendarX2, Layout, Briefcase
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
      { path: '/admin/user/hero', icon: Package, label: 'Hero Banners', isSiteMgmt: true },
      { path: '/admin/user/booking', icon: Target, label: 'Service Categories', isSiteMgmt: true },
      { path: '/admin/user/events', icon: Trophy, label: 'Event Banners', isSiteMgmt: true },
      { path: '/admin/arena/details', icon: Building2, label: 'Arena Details', isArenaMgmt: true },
      { path: '/admin/bookings', icon: CalendarClock, label: 'Bookings' },
      { path: '/admin/coaching', icon: Users, label: 'Coaching' },
      { path: '/admin/inventory', icon: Package, label: 'Inventory' },
      { path: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
      { path: '/admin/sponsorships', icon: Briefcase, label: 'Sponsorships' },
      { path: '/admin/reports', icon: PieChart, label: 'Reports' },
      { path: '/admin/users', icon: Shield, label: 'Customers' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  },
];

const AdminSidebar = ({ isCollapsed, setIsCollapsed, onMobileClose }) => {
  const { user } = useAuth();

  const userRole = user?.role;

  // Defensive: if userRole is missing (e.g. auth not hydrated on production), show all items
  const filteredStructure = SIDEBAR_STRUCTURE.filter(section =>
    !userRole || section.roles.includes(userRole)
  ).map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || !userRole || item.roles.includes(userRole))
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
            {/* Section Divider */}
            {idx > 0 && <div className="mx-6 my-3 h-[1.5px] bg-[#D9E2EC] opacity-80" />}
            
            {/* Group Label */}
            {!isCollapsed && section.group !== 'Overview' && (
              <div className="px-7 py-2.5 pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#eb483f]">
                  {section.group}
                </p>
              </div>
            )}

            <div className="space-y-1 px-3">
              {/* Special Handling for Site Mgmt inside any group (mostly Operations) */}
              {(() => {
                const siteMgmtItems = section.items.filter(i => i.isSiteMgmt);
                const arenaMgmtItems = section.items.filter(i => i.isArenaMgmt);
                const otherItems = section.items.filter(i => !i.isSiteMgmt && !i.isArenaMgmt);
                
                return (
                  <>
                    {siteMgmtItems.length > 0 && (
                      <div className="group/sitemanager relative mb-1.5">
                        {/* Site Mgmt Item */}
                        <div className="flex items-center gap-4 px-4 py-3 rounded-[12px] text-[#243B53] hover:bg-white/60 hover:text-[#0A1F44] font-semibold cursor-pointer transition-all duration-300">
                          <Layout size={18} className="text-[#627D98] group-hover/sitemanager:text-[#eb483f]" />
                          {!isCollapsed && <span className="text-[13px] flex-1">Home Page Mgmt</span>}
                          {!isCollapsed && <ChevronRight size={14} className="opacity-40 group-hover/sitemanager:rotate-90 transition-transform" />}
                        </div>

                        {/* Hover Sub-items */}
                        <div className="hidden group-hover/sitemanager:block pt-1 pb-2 space-y-1 bg-white/40 rounded-xl mt-1 animate-in fade-in slide-in-from-left-2 transition-all duration-300">
                          {siteMgmtItems.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={() => onMobileClose?.()}
                              className={({ isActive }) =>
                                `flex items-center gap-4 px-9 py-2 rounded-[10px] transition-all duration-200 ${
                                  isActive 
                                    ? `text-[#eb483f] font-bold` 
                                    : `text-[#486581] hover:text-[#eb483f] font-medium`
                                }`
                              }
                            >
                              <item.icon size={14} className="shrink-0" />
                              {!isCollapsed && <span className="text-[12px]">{item.label}</span>}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}

                    {arenaMgmtItems.length > 0 && (
                      <div className="group/arenamanager relative mb-1.5">
                        {/* Arena Mgmt Item */}
                        <div className="flex items-center gap-4 px-4 py-3 rounded-[12px] text-[#243B53] hover:bg-white/60 hover:text-[#0A1F44] font-semibold cursor-pointer transition-all duration-300">
                          <Building2 size={18} className="text-[#627D98] group-hover/arenamanager:text-[#eb483f]" />
                          {!isCollapsed && <span className="text-[13px] flex-1">Arena Management</span>}
                          {!isCollapsed && <ChevronRight size={14} className="opacity-40 group-hover/arenamanager:rotate-90 transition-transform" />}
                        </div>

                        {/* Hover Sub-items */}
                        <div className="hidden group-hover/arenamanager:block pt-1 pb-2 space-y-1 bg-white/40 rounded-xl mt-1 animate-in fade-in slide-in-from-left-2 transition-all duration-300">
                          {arenaMgmtItems.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={() => onMobileClose?.()}
                              className={({ isActive }) =>
                                `flex items-center gap-4 px-9 py-2 rounded-[10px] transition-all duration-200 ${
                                  isActive 
                                    ? `text-[#eb483f] font-bold` 
                                    : `text-[#486581] hover:text-[#eb483f] font-medium`
                                }`
                              }
                            >
                              <item.icon size={14} className="shrink-0" />
                              {!isCollapsed && <span className="text-[12px]">{item.label}</span>}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}

                    {otherItems.map((item) => (
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
                  </>
                );
              })()}
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
