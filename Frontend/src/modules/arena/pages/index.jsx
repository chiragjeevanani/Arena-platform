// Wrapper that gives each arena sub-page its own light content area inside the dark arena layout
import ArenaDetails from '../../admin/pages/ArenaPanel/ArenaDetails';
import CourtMgmt from '../../admin/pages/ArenaPanel/CourtMgmt';
import SlotConfig from '../../admin/pages/ArenaPanel/SlotConfig';
import PricingRules from '../../admin/pages/ArenaPanel/PricingRules';
import AvailabilityControl from '../../admin/pages/ArenaPanel/AvailabilityControl';
import Inventory from '../../admin/pages/Inventory';
import EventsAdmin from '../../admin/pages/EventsAdmin';
import RetailPOS from '../../admin/pages/RetailPOS';
import AccountSettings from './AccountSettings';
import StaffAttendance from '../../admin/pages/ArenaPanel/StaffAttendance';
import StaffRoster from '../../admin/pages/ArenaPanel/StaffRoster';

export const StaffRosterPage = () => (
  <PageShell title="My Staff" subtitle="Everyone working at this arena under the arena admin" component={StaffRoster} />
);
import WalkInBooking from '../../admin/pages/ArenaPanel/WalkInBooking';
import AttendanceRegister from '../../admin/pages/ArenaPanel/AttendanceRegister';

export const AttendanceRegisterPage = () => (
  <PageShell
    title="Attendance Register"
    subtitle="Check and verify the attendance coaches record for each class"
    component={AttendanceRegister}
  />
);

// Helper: wraps a light-theme page inside the dark arena layout content area
const PageShell = ({ title, subtitle, component: Component }) => (
  <div className="min-h-full bg-transparent">
    {/* Page Header Bar */}
    <div className="px-4 py-4 md:px-8 bg-transparent">
      <h2 className="text-2xl font-bold text-[#36454F]">{title}</h2>
      <p className="text-[12px] text-slate-500 font-semibold mt-1">{subtitle}</p>
    </div>
    {/* Light content area */}
    <div className="p-4 md:p-6 lg:p-8">
      <Component />
    </div>
  </div>
);

export const WalkInPage = () => (
  <PageShell
    title="Walk-in Booking"
    subtitle="Book a court for a customer at the front desk"
    component={WalkInBooking}
  />
);

export const ArenaDetailsPage = () => (
  <PageShell
    title="Arena Details"
    subtitle="Configure basic info, amenities, gallery and banner images"
    component={ArenaDetails}
    color="#CE2029"
  />
);

export const CourtMgmtPage = () => (
  <PageShell
    title="Court Management"
    subtitle="Add, edit and manage individual badminton courts"
    component={CourtMgmt}
    color="#6366f1"
  />
);

export const SlotConfigPage = () => (
  <PageShell
    title="Slot Configuration"
    subtitle="Set weekday and weekend time slots for bookings"
    component={SlotConfig}
    color="#f59e0b"
  />
);

export const PricingRulesPage = () => (
  <PageShell
    title="Pricing Rules"
    subtitle="Configure base, peak hour, and weekend pricing"
    component={PricingRules}
    color="#22c55e"
  />
);

export const AvailabilityPage = () => (
  <PageShell
    title="Availability Control"
    subtitle="Block slots and manage court closures via calendar"
    component={AvailabilityControl}
    color="#0ea5e9"
  />
);

export const InventoryPage = () => (
  <PageShell
    title="Inventory Management"
    subtitle="Track stadium equipment, shuttlecocks, and consumables"
    component={Inventory}
    color="#CE2029"
  />
);

export const EventsAdminPage = () => (
  <PageShell
    title="Event Management"
    subtitle="Organize local tournaments, leagues and championships"
    component={EventsAdmin}
    color="#f59e0b"
  />
);

export const RetailPOSPage = () => (
  <PageShell
    title="Retail Hub"
    subtitle="Sell products, drinks and equipment to walk-in players"
    component={RetailPOS}
    color="#CE2029"
  />
);

export const AccountSettingsPage = () => (
  <AccountSettings />
);

export const AttendancePage = () => (
  <PageShell
    title="Staff Attendance"
    subtitle="Mark daily attendance for all staff, see daily reports and each person's history"
    component={StaffAttendance}
    color="#CE2029"
  />
);
