import { useSearchParams } from 'react-router-dom';
import { useArenaPanel } from '../context/ArenaPanelContext';
import { useAuth } from '../../user/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Target, Clock, DollarSign,
  MapPin, Phone, Shield, Layers, ChevronRight
} from 'lucide-react';
import { CalendarX2 } from 'lucide-react';


import ArenaDetails from './ArenaPanel/ArenaDetails';
import CourtMgmt from './ArenaPanel/CourtMgmt';
import SlotConfig from './ArenaPanel/SlotConfig';
import PricingRules from './ArenaPanel/PricingRules';
import AvailabilityControl from './ArenaPanel/AvailabilityControl';
import WalkInBooking from './ArenaPanel/WalkInBooking';
import MembershipAdmin from './ArenaPanel/MembershipAdmin';
import ArenaAnalytics from './ArenaPanel/ArenaAnalytics';
import StaffManagement from './ArenaPanel/StaffManagement';
import ArenaIncome from './ArenaPanel/ArenaIncome';
import GuestSystem from './ArenaPanel/GuestSystem';
import Broadcaster from './ArenaPanel/Broadcaster';
import PolicySettings from './ArenaPanel/PolicySettings';
import MaintenanceScheduler from './ArenaPanel/MaintenanceScheduler';

import StaffAttendance from './ArenaPanel/StaffAttendance';
import StaffRoster from './ArenaPanel/StaffRoster';
import ReservedSlots from './ArenaPanel/ReservedSlots';
import WholeArenaBooking from './ArenaPanel/WholeArenaBooking';
import { Building2 as WholeArenaIcon } from 'lucide-react';
import AttendanceRegister from './ArenaPanel/AttendanceRegister';
import CoachingBatches from './ArenaPanel/CoachingBatches';
import { GraduationCap as CoachingIcon } from 'lucide-react';
import { ClipboardCheck } from 'lucide-react';

import { 
  Users, BarChart3, ShoppingCart, Wallet, UserCheck, 
  Megaphone, ShieldCheck, PenTool, Package, Trophy, Store,
  CreditCard
} from 'lucide-react';

import Inventory from './Inventory';
import EventsAdmin from './EventsAdmin';
import RetailPOS from './RetailPOS';

const TABS = [
  {
    id: 'details',
    label: 'Arena Details',
    shortLabel: 'Details',
    icon: Building2,
    description: 'Basic info, images & amenities',
    color: '#CE2029',
  },
  {
    id: 'courts',
    label: 'Court Management',
    shortLabel: 'Courts',
    icon: Target,
    description: 'Add, edit & manage courts',
    color: '#6366f1',
  },
  {
    id: 'walkin',
    label: 'Walk-in Terminal',
    shortLabel: 'Walk-in',
    icon: ShoppingCart,
    description: 'Book for customers on-site',
    color: '#22c55e',
  },
  {
    id: 'analytics',
    label: 'Court Analytics',
    shortLabel: 'Analytics',
    icon: BarChart3,
    description: 'Revenue & occupancy per court',
    color: '#f59e0b',
  },
  {
    id: 'income',
    label: 'Income Reports',
    shortLabel: 'Income',
    icon: Wallet,
    description: 'Earnings & payout records',
    color: '#36454F',
  },
  {
    id: 'guest',
    label: 'Guest System',
    shortLabel: 'Guest',
    icon: UserCheck,
    description: 'Visitor check-in & tracking',
    color: '#6366f1',
  },
  {
    id: 'staff',
    label: 'Staff Management',
    shortLabel: 'Staff',
    icon: Users,
    description: 'Manage roles & permissions',
    color: '#CE2029',
  },
  {
    id: 'reserved',
    label: 'Reserved Slots',
    shortLabel: 'Reserved',
    icon: CalendarX2,
    description: 'Hold a court time for a regular player for a period',
    color: '#0E7490',
  },
  {
    id: 'arena-booking',
    label: 'Whole-Arena Booking',
    shortLabel: 'Whole Arena',
    icon: WholeArenaIcon,
    description: 'Book every court for one client for a whole day',
    color: '#0E7490',
  },
  {
    id: 'team',
    label: 'Staff',
    shortLabel: 'Staff',
    icon: Users,
    description: 'Staff working under the arena admin',
    color: '#0E7490',
  },
  {
    id: 'coach-attendance',
    label: 'Staff Attendance',
    shortLabel: 'Attendance',
    icon: UserCheck,
    description: 'Daily attendance for all staff, reports and export',
    color: '#CE2029',
  },
  {
    id: 'coaching-batches',
    label: 'Coaching Batches',
    shortLabel: 'Coaching',
    icon: CoachingIcon,
    description: 'Student attendance, add students, app sign-up',
    color: '#0E7490',
  },
  {
    id: 'register',
    label: 'Attendance Register',
    shortLabel: 'Register',
    icon: ClipboardCheck,
    description: 'Verify coaching attendance',
    color: '#16a34a',
  },
  {
    id: 'notices',
    label: 'Broadcaster',
    shortLabel: 'Notice',
    icon: Megaphone,
    description: 'Send alerts to players',
    color: '#f59e0b',
  },
  {
    id: 'membership',
    label: 'Membership Plans',
    shortLabel: 'Members',
    icon: CreditCard,
    description: 'Add, edit & manage membership plans',
    color: '#CE2029',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',

    shortLabel: 'Maint.',
    icon: PenTool,
    description: 'Schedule court repairs',
    color: '#22c55e',
  },
  {
    id: 'policies',
    label: 'Policies',
    shortLabel: 'Policy',
    icon: ShieldCheck,
    description: 'Refund & cancellation rules',
    color: '#6366f1',
  },
  {
    id: 'slots',
    label: 'Slot Configuration',
    shortLabel: 'Slots',
    icon: Clock,
    description: 'Weekday & weekend time slots',
    color: '#f59e0b',
  },
  {
    id: 'pricing',
    label: 'Pricing Rules',
    shortLabel: 'Pricing',
    icon: DollarSign,
    description: 'Base, peak & weekend rates',
    color: '#22c55e',
  },
  {
    id: 'availability',
    label: 'Availability Control',
    shortLabel: 'Availability',
    icon: CalendarX2,
    description: 'Block slots & manage closures',
    color: '#0ea5e9',
  },
  {
    id: 'inventory',
    label: 'Inventory Management',
    shortLabel: 'Inventory',
    icon: Package,
    description: 'Track equipment & stock levels',
    color: '#CE2029',
  },
  {
    id: 'events',
    label: 'Event Management',
    shortLabel: 'Events',
    icon: Trophy,
    description: 'Leagues & local championships',
    color: '#f59e0b',
  },
  {
    id: 'retail',
    label: 'Retail Hub',
    shortLabel: 'Shop',
    icon: Store,
    description: 'Sell products & drinks',
    color: '#CE2029',
  },
];


// Prototype screens that show sample data and save nothing (each carries a "DEMO UI" banner).
// Hidden until they are wired to real data; the real equivalents are Financial Reports,
// Daily Court Report, Users, Membership Management and the 24-hour cancellation rule.
const PROTOTYPE_TABS = new Set(['analytics', 'income', 'guest', 'staff', 'notices', 'membership', 'maintenance', 'policies']);
const VISIBLE_TABS = TABS.filter((t) => !PROTOTYPE_TABS.has(t.id));

const ArenaManagementPanel = () => {
  const { user } = useAuth();
  const { arena, allArenas, selectedArenaId, setSelectedArenaId } = useArenaPanel();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab');
  const activeTab = tabQuery && !PROTOTYPE_TABS.has(tabQuery) ? tabQuery : 'details';

  const setActiveTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const active = VISIBLE_TABS.find(t => t.id === activeTab) || VISIBLE_TABS[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'details': return <ArenaDetails />;
      case 'courts': return <CourtMgmt />;
      case 'slots': return <SlotConfig />;
      case 'pricing': return <PricingRules />;
      case 'availability': return <AvailabilityControl />;
      case 'walkin': return <WalkInBooking />;
      case 'membership': return <MembershipAdmin />;
      case 'analytics': return <ArenaAnalytics />;
      case 'staff': return <StaffManagement />;
      case 'income': return <ArenaIncome />;
      case 'guest': return <GuestSystem />;
      case 'notices': return <Broadcaster />;
      case 'policies': return <PolicySettings />;
      case 'maintenance': return <MaintenanceScheduler />;
      case 'coach-attendance': return <StaffAttendance />;
      case 'team': return <StaffRoster />;
      case 'reserved': return <ReservedSlots />;
      case 'arena-booking': return <WholeArenaBooking />;
      case 'register': return <AttendanceRegister />;
      case 'coaching-batches': return <CoachingBatches />;
      case 'inventory': return <Inventory />;
      case 'events': return <EventsAdmin />;
      case 'retail': return <RetailPOS />;
      default: return null;
    }
  };

  return (
    <div className="bg-[#F4F7F6] min-h-full font-sans text-[#36454F]">
      <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-6 p-3 md:p-4 lg:p-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <Shield size={11} className="text-[#CE2029]" /> Admin
              <ChevronRight size={11} />
              <span>Arena Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#36454F] flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#CE2029] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#CE2029]/30">
                <Building2 size={22} className="text-white" strokeWidth={2.5} />
              </div>
              Arena Management
            </h1>
            <p className="text-sm text-slate-500 font-bold mt-1.5 ml-1">
              Manage courts, slots, pricing, inventory, and local events for your arena.
            </p>
          </div>

          {/* Arena Badge */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#CE2029]/10 flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-[#CE2029]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Arena</p>
              {user?.role === 'SUPER_ADMIN' && allArenas?.length > 0 ? (
                <select
                  value={selectedArenaId}
                  onChange={(e) => setSelectedArenaId(e.target.value)}
                  className="font-black text-[#36454F] text-sm bg-transparent border-0 outline-none p-0 pr-6 cursor-pointer focus:ring-0 focus:outline-none w-full truncate"
                >
                  {allArenas.map((a) => (
                    <option key={a._id || a.id} value={a._id || a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-black text-[#36454F] text-sm truncate">{arena?.name || 'Amm Sports arena'}</p>
              )}
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                <Phone size={9} className="text-[#CE2029]" /> {arena?.phone || '—'}
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 ml-2" />
          </div>
        </div>

        {/* Tab Navigation — Scrollable on mobile */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max md:min-w-0">
              {VISIBLE_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2.5 px-4 md:px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex-1 justify-center md:justify-start whitespace-nowrap ${
                      isActive
                        ? 'text-[#ffffff] border-transparent'
                        : 'text-slate-400 border-transparent hover:text-[#36454F] hover:bg-slate-50'
                    }`}
                    style={isActive ? { backgroundColor: tab.color, borderBottomColor: tab.color } : {}}>
                    <tab.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Description */}
          <div className="px-5 py-3 bg-gradient-to-r border-t border-slate-100 flex items-center gap-2"
            style={{ background: `linear-gradient(to right, ${active.color}08, transparent)` }}>
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: active.color }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: active.color }}>
              {active.label}
            </p>
            <span className="text-[10px] text-slate-400 font-bold">— {active.description}</span>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ArenaManagementPanel;
