import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Target, Clock, DollarSign, CalendarX2,
  ChevronLeft, ChevronRight, LayoutDashboard, LogOut,
  ArrowLeftRight, Package, Trophy, Store, Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/Logo (3).png';
import SidebarImage from '../../../assets/sidebarImage.png';

const NAV_ITEMS = [
  { path: '/arena', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/arena/ledger', icon: Receipt, label: 'Booking Ledger' },
  { path: '/arena/details', icon: Building2, label: 'Arena Details' },
  { path: '/arena/courts', icon: Target, label: 'Court Management' },
  { path: '/arena/slots', icon: Clock, label: 'Slot Configuration' },
  { path: '/arena/availability', icon: CalendarX2, label: 'Availability' },
  { path: '/arena/inventory', icon: Package, label: 'Inventory' },
  { path: '/arena/events', icon: Trophy, label: 'Event Management' },
  { path: '/arena/retail', icon: Store, label: 'Retail Hub' },
];

const ArenaSidebar = ({ isCollapsed, setIsCollapsed, onMobileClose }) => {
  const navigate = useNavigate();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="h-full md:h-screen sticky top-0 flex flex-col z-[100] relative shadow-lg bg-[#E8EDF2]"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#CE2029] to-transparent opacity-50" />

      {/* Header / Logo */}
      <div className="h-20 border-b border-[#D9E2EC] flex items-center justify-center px-6 shrink-0 relative z-20">
        <div className={`shrink-0 flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20 scale-125'}`}>
          <img src={Logo} alt="Arena Panel" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Role Badge */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-4 mt-4 px-4 py-2.5 rounded-xl bg-white border border-[#D9E2EC] shadow-sm text-center"
          >
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#CE2029]">Arena Management</p>
            <p className="text-[11px] font-semibold text-[#36454F] mt-0.5">AMM Sports Arena</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical border */}
      <div className="absolute right-0 top-20 bottom-0 w-[1px] bg-[#D9E2EC] pointer-events-none z-10" />

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-28 -right-4 w-8 h-8 bg-white border border-[#D9E2EC] rounded-full flex items-center justify-center text-[#CE2029] hover:bg-[#CE2029] hover:text-white transition-colors z-[110] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-36 space-y-1 scrollbar-hide shrink-0 relative z-20 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => onMobileClose?.()}
            className={({ isActive }) =>
              `relative flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all duration-300 group overflow-hidden ${
                isActive
                  ? 'bg-white text-[#CE2029] shadow-[0_4px_15px_rgba(206, 32, 41,0.15)] font-semibold'
                  : 'text-[#243B53] hover:bg-white/60 hover:text-[#36454F] font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`shrink-0 transition-all duration-300 relative z-10 ${
                    isActive ? 'text-[#CE2029]' : 'text-[#627D98] group-hover:text-[#CE2029]'
                  }`}
                />
                <AnimatePresence mode="popLayout">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap tracking-wide text-[13px] relative z-10"
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

      {/* Background Image at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 z-10 pointer-events-none overflow-hidden rounded-br-2xl md:rounded-b-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <img 
          src={SidebarImage} 
          alt="Badminton Arena" 
          className="w-full h-full object-cover opacity-60"
        />
      </div>
    </motion.aside>
  );
};

export default ArenaSidebar;
