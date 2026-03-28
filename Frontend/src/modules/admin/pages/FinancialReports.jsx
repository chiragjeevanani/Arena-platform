import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Download, Calendar, ArrowUpRight, ArrowDownLeft,
  DollarSign, Wallet, CreditCard, Filter, ChevronRight,
  TrendingUp, BarChart3, Receipt, X, ArrowRight, Mail,
  FileText, Building2, GraduationCap, ShoppingBag, Star,
  Package, AlertCircle, Users, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

// ── Mock Data ──────────────────────────────────────────────────
const weeklyRevenue = [
  { name: 'Mon', courts: 2400, coaching: 1200, retail: 400, events: 0 },
  { name: 'Tue', courts: 1800, coaching: 980, retail: 320, events: 600 },
  { name: 'Wed', courts: 3200, coaching: 2400, retail: 580, events: 0 },
  { name: 'Thu', courts: 2100, coaching: 1700, retail: 290, events: 0 },
  { name: 'Fri', courts: 2900, coaching: 1100, retail: 440, events: 1200 },
  { name: 'Sat', courts: 5100, coaching: 3800, retail: 820, events: 2000 },
  { name: 'Sun', courts: 6200, coaching: 4300, retail: 910, events: 1800 },
];

const monthlyRevenue = [
  { name: 'Jan', revenue: 18400 }, { name: 'Feb', revenue: 21200 }, { name: 'Mar', revenue: 25100 },
  { name: 'Apr', revenue: 22800 }, { name: 'May', revenue: 31500 }, { name: 'Jun', revenue: 38200 },
  { name: 'Jul', revenue: 35100 }, { name: 'Aug', revenue: 29800 }, { name: 'Sep', revenue: 33600 },
  { name: 'Oct', revenue: 41200 }, { name: 'Nov', revenue: 38700 }, { name: 'Dec', revenue: 45900 },
];

const courtUtilization = [
  { name: 'Court 1', utilization: 87, revenue: 12400 },
  { name: 'Court 2', utilization: 73, revenue: 10200 },
  { name: 'Court 3', utilization: 91, revenue: 14100 },
  { name: 'Court 4', utilization: 65, revenue: 8900 },
  { name: 'Court 5', utilization: 78, revenue: 11200 },
];

const coachingRevenue = [
  { name: 'Jan', morning: 4200, evening: 3100, weekend: 5800 },
  { name: 'Feb', morning: 3900, evening: 2800, weekend: 4900 },
  { name: 'Mar', morning: 5100, evening: 3600, weekend: 6200 },
  { name: 'Apr', morning: 4800, evening: 3200, weekend: 5500 },
];

const revenueBySource = [
  { name: 'Court Bookings', value: 52, color: '#eb483f' },
  { name: 'Coaching', value: 28, color: '#1a2b3c' },
  { name: 'Retail POS', value: 10, color: '#E88E3E' },
  { name: 'Events', value: 7, color: '#76A87A' },
  { name: 'Sponsorships', value: 3, color: '#64748b' },
];

const outstandingPayments = [
  { id: 'BK-1002', customer: 'Rajesh Kumar', amount: 3.500, type: 'Court Booking', dueDate: '2026-03-15', days: 13 },
  { id: 'AC-2201', customer: 'Priya Sharma', amount: 25.000, type: 'Coaching Fee', dueDate: '2026-03-10', days: 18 },
  { id: 'BK-1007', customer: 'Anand Rao', amount: 4.500, type: 'Court Booking', dueDate: '2026-03-20', days: 8 },
  { id: 'AC-2198', customer: 'Kavita Nair', amount: 35.000, type: 'Coaching — Quarterly', dueDate: '2026-03-05', days: 23 },
];

const ledgerEntries = [
  { type: 'Court Bookings', id: 'TR-1082XN', amount: 8200, mode: 'Credit', date: '12 Mar 2026' },
  { type: 'Academy Fees', id: 'TR-1081XN', amount: 12500, mode: 'Credit', date: '12 Mar 2026' },
  { type: 'POS Retail', id: 'TR-1080XN', amount: 4100, mode: 'Credit', date: '11 Mar 2026' },
  { type: 'Maintenance', id: 'TR-1079XN', amount: 15000, mode: 'Debit', date: '11 Mar 2026' },
  { type: 'Event Revenue', id: 'TR-1078XN', amount: 6200, mode: 'Credit', date: '10 Mar 2026' },
  { type: 'Sponsorship', id: 'TR-1077XN', amount: 3000, mode: 'Credit', date: '10 Mar 2026' },
];

// ── Tab Config ─────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'courts', label: 'Court Utilization', icon: Building2 },
  { id: 'coaching', label: 'Coaching Revenue', icon: GraduationCap },
  { id: 'retail', label: 'Retail & Events', icon: ShoppingBag },
  { id: 'outstanding', label: 'Outstanding', icon: AlertCircle },
  { id: 'ledger', label: 'Master Ledger', icon: FileText },
];

// ── Chart Tooltip ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-[11px]">
        <p className="font-black text-[#1a2b3c] mb-2 uppercase tracking-wider">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: OMR {Number(p.value).toFixed(3)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Main Component ─────────────────────────────────────────────
const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [rangeFilter, setRangeFilter] = useState('Weekly');

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3 text-[#1a2b3c]">
              <PieChart className="text-[#eb483f]" size={24} strokeWidth={2.5} /> Financial Analytics
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Real-time revenue tracking across all streams.</p>
          </div>
          <button onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] text-white text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <Download size={16} strokeWidth={3} /> Export Statements
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Gross Revenue', value: 'OMR 12,400.000', change: '+24.5%', icon: DollarSign, color: '#eb483f' },
            { label: 'OPEX / Costs', value: 'OMR 2,240.000', change: '-2.1%', icon: Wallet, color: '#ff6b6b' },
            { label: 'Net Profit', value: 'OMR 10,200.000', change: '+28.2%', icon: BarChart3, color: '#eb483f' },
            { label: 'Outstanding', value: `OMR ${outstandingPayments.reduce((a, p) => a + p.amount, 0).toFixed(3)}`, change: '+4', icon: AlertCircle, color: '#E88E3E' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col justify-between transition-all hover:border-[#eb483f]/50 hover:shadow-md group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors group-hover:scale-110"
                  style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black ${stat.change.startsWith('+') ? 'text-[#76A87A]' : 'text-[#ff6b6b]'}`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />} {stat.change}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-lg md:text-xl font-black text-[#1a2b3c] tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-[#eb483f] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-[#eb483f]/30 hover:text-[#eb483f]'
                }`}>
                <Icon size={13} strokeWidth={2.5} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Velocity Chart */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp size={16} className="text-[#eb483f]" /> Revenue By Stream
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Courts · Coaching · Retail · Events</p>
                      </div>
                      <div className="flex gap-1">
                        {['Weekly', 'Monthly'].map(r => (
                          <button key={r} onClick={() => setRangeFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${rangeFilter === r ? 'bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/20' : 'text-slate-400 border border-transparent hover:text-slate-600'}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {rangeFilter === 'Weekly' ? (
                          <BarChart data={weeklyRevenue} barSize={8} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,43,60,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="courts" name="Courts" fill="#eb483f" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="coaching" name="Coaching" fill="#1a2b3c" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="retail" name="Retail" fill="#E88E3E" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="events" name="Events" fill="#76A87A" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : (
                          <AreaChart data={monthlyRevenue}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eb483f" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#eb483f" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,43,60,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#eb483f" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Split Pie */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                    <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-1">Revenue Split</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">By stream %</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={revenueBySource} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                            {revenueBySource.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `${v}%`} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-2">
                      {revenueBySource.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-[#1a2b3c]">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tax Reconciliation */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-6">Tax Reconciliation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Tax Collected', value: 'OMR 1,440.000', percent: 78, color: '#eb483f' },
                      { label: 'Credits Available', value: 'OMR 412.000', percent: 45, color: '#E88E3E' },
                      { label: 'Reserves', value: 'OMR 56.100', percent: 25, color: '#76A87A' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                          <span className="text-sm font-black text-[#1a2b3c]">{item.value}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.percent}%` }} transition={{ duration: 1.2, delay: idx * 0.2 }}
                            className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{item.percent}% of target</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── COURT UTILIZATION TAB ── */}
            {activeTab === 'courts' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Avg Utilization', value: '78.8%', icon: Layers, color: '#eb483f' },
                    { label: 'Peak Court', value: 'Court 3 — 91%', icon: Building2, color: '#76A87A' },
                    { label: 'Revenue / Court', value: 'OMR 11,360', icon: DollarSign, color: '#eb483f' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                        <s.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                        <p className="text-lg font-black text-[#1a2b3c] mt-0.5">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-6">Court Performance Report</h3>
                  <div className="space-y-5">
                    {courtUtilization.map((court, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#eb483f]/10 flex items-center justify-center">
                              <Building2 size={14} className="text-[#eb483f]" />
                            </div>
                            <span className="text-sm font-black text-[#1a2b3c]">{court.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-[11px] font-black text-slate-400">OMR {court.revenue.toLocaleString()}</span>
                            <span className="text-sm font-black text-[#eb483f]">{court.utilization}%</span>
                          </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${court.utilization}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full rounded-full" style={{ backgroundColor: court.utilization > 85 ? '#76A87A' : court.utilization > 70 ? '#eb483f' : '#E88E3E' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-6">Peak vs Off-Peak Revenue</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyRevenue} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,43,60,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="courts" name="Courts" fill="#eb483f" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ── COACHING REVENUE TAB ── */}
            {activeTab === 'coaching' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Coaching Revenue', value: 'OMR 4,800.000', icon: GraduationCap, color: '#eb483f' },
                    { label: 'Active Batches', value: '12', icon: Layers, color: '#1a2b3c' },
                    { label: 'Total Students', value: '148', icon: Users, color: '#eb483f' },
                    { label: 'Avg per Batch', value: 'OMR 400.000', icon: DollarSign, color: '#E88E3E' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                        <s.icon size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                        <p className="text-lg font-black text-[#1a2b3c] mt-0.5">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-6">Coaching Revenue by Batch Type</h3>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={coachingRevenue} barSize={18} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,43,60,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="morning" name="Morning" fill="#eb483f" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="evening" name="Evening" fill="#1a2b3c" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="weekend" name="Weekend" fill="#E88E3E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-4">Batch Occupancy Report</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Morning Elite (Vikram Singh)', enrolled: 18, capacity: 20, revenue: 450 },
                      { name: 'Evening Pro (Anjali Sharma)', enrolled: 14, capacity: 20, revenue: 350 },
                      { name: 'Weekend Junior (Rohan Das)', enrolled: 22, capacity: 25, revenue: 385 },
                      { name: 'Advanced (Priya Kumar)', enrolled: 10, capacity: 15, revenue: 500 },
                    ].map((batch, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[#1a2b3c] truncate">{batch.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{batch.enrolled}/{batch.capacity} students · OMR {batch.revenue}/month</p>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full rounded-full bg-[#eb483f]" style={{ width: `${(batch.enrolled / batch.capacity) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#eb483f]">{Math.round((batch.enrolled / batch.capacity) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── RETAIL & EVENTS TAB ── */}
            {activeTab === 'retail' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'POS Revenue', value: 'OMR 3,470.000', icon: ShoppingBag, color: '#E88E3E' },
                    { label: 'Transactions', value: '284', icon: Receipt, color: '#eb483f' },
                    { label: 'Event Revenue', value: 'OMR 5,600.000', icon: Star, color: '#76A87A' },
                    { label: 'Sponsorships', value: 'OMR 1,200.000', icon: DollarSign, color: '#1a2b3c' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                        <s.icon size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                        <p className="text-lg font-black text-[#1a2b3c] mt-0.5">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                    <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-4">POS Top Items</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Shuttlecocks (Pack of 6)', qty: 142, revenue: 852 },
                        { name: 'Grip Tape', qty: 98, revenue: 196 },
                        { name: 'Badminton Racket (Mid-range)', qty: 24, revenue: 1440 },
                        { name: 'Sports Drinks', qty: 310, revenue: 465 },
                        { name: 'Sports Bags', qty: 18, revenue: 517 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#eb483f]/10 flex items-center justify-center">
                              <Package size={11} className="text-[#eb483f]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1a2b3c]">{item.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold">{item.qty} units sold</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#eb483f]">OMR {item.revenue.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:border-[#eb483f]/40 transition-all">
                    <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-4">Events Revenue</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Club Championship — Mar', type: 'Tournament', revenue: 2200 },
                        { name: 'Open Day — Feb', type: 'Community', revenue: 800 },
                        { name: 'Corporate League — Mar', type: 'Corporate', revenue: 1800 },
                        { name: 'Junior Cup — Jan', type: 'Tournament', revenue: 800 },
                      ].map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div>
                            <p className="text-xs font-black text-[#1a2b3c]">{event.name}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#76A87A]/10 text-[#76A87A] border border-[#76A87A]/20">{event.type}</span>
                          </div>
                          <span className="text-sm font-black text-[#76A87A]">+OMR {event.revenue.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── OUTSTANDING PAYMENTS TAB ── */}
            {activeTab === 'outstanding' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Outstanding', value: `OMR ${outstandingPayments.reduce((a, p) => a + p.amount, 0).toFixed(3)}`, color: '#ff6b6b' },
                    { label: 'Overdue > 14d', value: `${outstandingPayments.filter(p => p.days > 14).length} bookings`, color: '#E88E3E' },
                    { label: 'Recovery Rate', value: '86.2%', color: '#76A87A' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                      <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:border-[#eb483f]/40 transition-all">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest">Outstanding Payment Register</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{outstandingPayments.length} entries</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[600px]">
                      <thead className="bg-[#F8F9FA] border-b border-slate-100">
                        <tr>
                          {['Ref ID', 'Customer', 'Type', 'Amount', 'Due Date', 'Days Overdue', 'Action'].map(h => (
                            <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {outstandingPayments.map((pay, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4 font-black text-[#1a2b3c] text-xs">{pay.id}</td>
                            <td className="px-5 py-4 font-bold text-slate-700">{pay.customer}</td>
                            <td className="px-5 py-4"><span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 text-slate-500">{pay.type}</span></td>
                            <td className="px-5 py-4 font-black text-[#eb483f]">OMR {pay.amount.toFixed(3)}</td>
                            <td className="px-5 py-4 text-xs font-bold text-slate-500">{pay.dueDate}</td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-black px-2 py-1 rounded-lg ${pay.days > 14 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}>{pay.days}d overdue</span>
                            </td>
                            <td className="px-5 py-4">
                              <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-[#eb483f] text-white hover:bg-[#d43b33] transition-all">Send Reminder</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── MASTER LEDGER TAB ── */}
            {activeTab === 'ledger' && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:border-[#eb483f]/40 transition-all">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest">Master Ledger</h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">All operational entries</p>
                    </div>
                    <button className="text-[10px] font-black text-[#eb483f] uppercase tracking-widest border-b-2 border-[#eb483f] pb-0.5">Full Audit Log</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6">
                    {ledgerEntries.map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-[#eb483f] shadow-sm group-hover:rotate-12 transition-transform">
                            <Receipt size={18} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="text-[13px] font-extrabold text-[#1a2b3c]">{tx.type}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.id} · {tx.date}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black tracking-tight" style={{ color: tx.mode === 'Debit' ? '#ff6b6b' : '#76A87A' }}>
                          {tx.mode === 'Debit' ? '-' : '+'}OMR {tx.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-black text-[#1a2b3c] flex items-center gap-2"><FileText className="text-[#eb483f]" size={22} /> Export Statements</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Generate financial report</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-400 bg-white border border-slate-200 shadow-sm"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Date From</label>
                      <input type="date" className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Date To</label>
                      <input type="date" className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Report Type</label>
                      <select className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] transition-all appearance-none">
                        <option>All Streams</option>
                        <option>Court Bookings</option>
                        <option>Coaching Revenue</option>
                        <option>Retail POS</option>
                        <option>Events & Sponsorships</option>
                        <option>Outstanding Payments</option>
                        <option>Tax Summary</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">File Format</label>
                      <select className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] transition-all appearance-none">
                        <option>PDF Report</option>
                        <option>Spreadsheet (CSV)</option>
                        <option>Excel (.xlsx)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Send To Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                      <input type="email" placeholder="finance@arena.com" className="w-full py-3 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400 transition-all" />
                    </div>
                  </div>
                  <button onClick={() => setShowExportModal(false)}
                    className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    Generate Report <Download size={16} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default FinancialReports;
