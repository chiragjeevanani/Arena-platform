// Wrapper that gives each arena sub-page its own light content area inside the dark arena layout
import ArenaDetails from '../../admin/pages/ArenaPanel/ArenaDetails';
import CourtMgmt from '../../admin/pages/ArenaPanel/CourtMgmt';
import SlotConfig from '../../admin/pages/ArenaPanel/SlotConfig';
import PricingRules from '../../admin/pages/ArenaPanel/PricingRules';
import AvailabilityControl from '../../admin/pages/ArenaPanel/AvailabilityControl';

// Helper: wraps a light-theme page inside the dark arena layout content area
const PageShell = ({ title, subtitle, component: Component, color = '#eb483f' }) => (
  <div className="min-h-full bg-transparent">
    {/* Page Header Bar */}
    <div className="px-4 py-4 md:px-8 bg-transparent">
      <h2 className="text-2xl font-black text-[#1a2b3c]">{title}</h2>
      <p className="text-[12px] text-slate-500 font-bold mt-1">{subtitle}</p>
    </div>
    {/* Light content area */}
    <div className="p-4 md:p-6 lg:p-8">
      <Component />
    </div>
  </div>
);

export const ArenaDetailsPage = () => (
  <PageShell
    title="Arena Details"
    subtitle="Configure basic info, amenities, gallery and banner images"
    component={ArenaDetails}
    color="#eb483f"
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
