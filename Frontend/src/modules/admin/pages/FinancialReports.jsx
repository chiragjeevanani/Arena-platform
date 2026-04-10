import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Download, Calendar, ArrowUpRight, ArrowDownLeft,
  DollarSign, Wallet, CreditCard, Filter, ChevronRight,
  TrendingUp, BarChart3, Receipt, X, ArrowRight, Mail,
  FileText, Building2, GraduationCap, ShoppingBag, Star,
  Package, AlertCircle, Users, Layers, Clock, CheckCircle2,
  MapPin, Printer, CloudUpload, Crown
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';

// ── Mock Data ──────────────────────────────────────────────────
const weeklyRevenue = [
  { name: 'Mon', courts: 2400, coaching: 1200, retail: 400, events: 0, membership: 850 },
  { name: 'Tue', courts: 1800, coaching: 980, retail: 320, events: 600, membership: 420 },
  { name: 'Wed', courts: 3200, coaching: 2400, retail: 580, events: 0, membership: 1200 },
  { name: 'Thu', courts: 2100, coaching: 1700, retail: 290, events: 0, membership: 600 },
  { name: 'Fri', courts: 2900, coaching: 1100, retail: 440, events: 1200, membership: 950 },
  { name: 'Sat', courts: 5100, coaching: 3800, retail: 820, events: 2000, membership: 1500 },
  { name: 'Sun', courts: 6200, coaching: 4300, retail: 910, events: 1800, membership: 2100 },
];

const correlationData = [
  { name: 'W1', events: 0, retail: 1200 },
  { name: 'W2', events: 2500, retail: 4800 },
  { name: 'W3', events: 0, retail: 1400 },
  { name: 'W4', events: 4000, retail: 7200 },
  { name: 'W5', events: 1200, retail: 2800 },
];

const monthlyRevenue = [
  { name: 'Jan', revenue: 18400 }, { name: 'Feb', revenue: 21200 }, { name: 'Mar', revenue: 25100 },
  { name: 'Apr', revenue: 22800 }, { name: 'May', revenue: 31500 }, { name: 'Jun', revenue: 38200 },
  { name: 'Jul', revenue: 35100 }, { name: 'Aug', revenue: 29800 }, { name: 'Sep', revenue: 33600 },
  { name: 'Oct', revenue: 41200 }, { name: 'Nov', revenue: 38700 }, { name: 'Dec', revenue: 45900 },
];

const courtUtilization = [
  { id: 'c1', name: 'Court 1', utilization: 87, revenue: 12400 },
  { id: 'c2', name: 'Court 2', utilization: 73, revenue: 10200 },
  { id: 'c3', name: 'Court 3', utilization: 91, revenue: 14100 },
  { id: 'c4', name: 'Court 4', utilization: 65, revenue: 8900 },
  { id: 'c5', name: 'Court 5', utilization: 78, revenue: 11200 },
];

const coachingRevenue = [
  { id: 'b1', name: 'Morning Elite', morning: 4200, evening: 0, weekend: 0, total: 4200 },
  { id: 'b2', name: 'Evening Pro', morning: 0, evening: 3600, weekend: 0, total: 3600 },
  { id: 'b3', name: 'Weekend Junior', morning: 0, evening: 0, weekend: 6200, total: 6200 },
];

const revenueBySource = [
  { name: 'Court Bookings', value: 42, color: '#CE2029' },
  { name: 'Coaching', value: 24, color: '#36454F' },
  { name: 'Memberships', value: 16, color: '#4287f5' },
  { name: 'Retail POS', value: 9, color: '#E88E3E' },
  { name: 'Events', value: 6, color: '#76A87A' },
  { name: 'Sponsorships', value: 3, color: '#64748b' },
];

const outstandingPayments = [
  { id: 'BK-1002', customer: 'Ali Al-Said', amount: 35, type: 'Court Booking', dueDate: '2026-03-15', days: 13 },
  { id: 'AC-2201', customer: 'Fatima Al-Harthy', amount: 250, type: 'Coaching Fee', dueDate: '2026-03-10', days: 18 },
  { id: 'BK-1007', customer: 'Salim Al-Abri', amount: 45, type: 'Court Booking', dueDate: '2026-03-20', days: 8 },
  { id: 'AC-2198', customer: 'Muna Al-Maskari', amount: 350, type: 'Coaching — Quarterly', dueDate: '2026-03-05', days: 23 },
];

const ledgerEntries = [
  { type: 'Court Bookings', id: 'TR-1082XN', amount: 82, mode: 'Credit', date: '12 Mar 2026' },
  { type: 'Academy Fees', id: 'TR-1081XN', amount: 125, mode: 'Credit', date: '12 Mar 2026' },
  { type: 'POS Retail', id: 'TR-1080XN', amount: 41, mode: 'Credit', date: '11 Mar 2026' },
  { type: 'Maintenance', id: 'TR-1079XN', amount: 150, mode: 'Debit', date: '11 Mar 2026' },
  { type: 'Event Revenue', id: 'TR-1078XN', amount: 62, mode: 'Credit', date: '10 Mar 2026' },
];

// ── Main Component ─────────────────────────────────────────────
const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState(false);
  const [rangeFilter, setRangeFilter] = useState('Weekly');
  
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [location, setLocation] = useState('AMM Sports Arena');
  
  const [selectedCourt, setSelectedCourt] = useState('All Courts');
  const [selectedBatch, setSelectedBatch] = useState('All Batches');

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportPreview(true);
    }, 1500);
  };

  const ReportPreviewDocument = () => (
    <div className="bg-slate-100 min-h-screen p-8 flex justify-center print:bg-white print:p-0 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-[800px] w-full bg-white shadow-2xl p-12 rounded-sm border border-slate-200 relative print:shadow-none print:border-0 print:m-0"
      >
        <div className="absolute top-4 right-4 print:hidden flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#36454F] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"><Printer size={14} /> Print Report</button>
          <button onClick={() => setReportPreview(false)} className="p-2 text-slate-400 hover:text-black"><X size={20} /></button>
        </div>

        <div className="flex justify-between items-start border-b-2 border-[#36454F] pb-8 mb-8">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 bg-[#CE2029] rounded-lg flex items-center justify-center text-white"><Star size={18} /></div>
                 <h1 className="text-2xl font-bold text-[#36454F] tracking-tight uppercase">Arena Intelligence</h1>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Operational Financial Audit Record</p>
           </div>
           <div className="text-right">
              <p className="text-[14px] font-bold text-[#36454F] mb-1 uppercase">Report ID: AI-2026-FMAR</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Generated: {new Date().toLocaleString()}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-8 bg-slate-50 p-6 rounded-lg">
           <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] mb-1">Fiscal Scope</p>
              <p className="text-[12px] font-bold text-[#36454F]">{startDate} to {endDate}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-tight">{location}</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] mb-1">Classification</p>
              <p className="text-[12px] font-bold text-[#36454F] uppercase">Consolidated Performance Audit</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-tight italic">Confidential Audit</p>
           </div>
        </div>

        <div className="mb-12">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#36454F] mb-4 border-l-4 border-[#CE2029] pl-3">I. Executive Summary</h3>
          <div className="grid grid-cols-3 gap-4">
             <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gross Inbound</p>
                <p className="text-[18px] font-bold text-[#36454F]">OMR 12,400</p>
             </div>
             <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total OPEX</p>
                <p className="text-[18px] font-bold text-[#CE2029]">OMR 2,240</p>
             </div>
             <div className="border border-slate-200 p-4 rounded-lg bg-[#36454F] text-white">
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Net Surplus</p>
                <p className="text-[18px] font-bold">OMR 10,160</p>
             </div>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#36454F] mb-4 border-l-4 border-[#CE2029] pl-3">II. Revenue Stream Distribution</h3>
          <table className="w-full text-left">
            <thead className="border-b border-slate-200">
               <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="py-2">Department</th>
                  <th className="py-2">Share</th>
                  <th className="py-2 text-right">Contribution</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {revenueBySource.map((s, i) => (
                 <tr key={i} className="text-[11px] font-semibold text-[#36454F]">
                    <td className="py-3">{s.name}</td>
                    <td className="py-3">{s.value}%</td>
                    <td className="py-3 text-right">OMR {(12400 * (s.value/100)).toFixed(0)}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-end">
           <div>
              <p className="text-[9px] font-semibold text-slate-400 max-w-[300px]">Audited against real-time transaction nodes.</p>
           </div>
           <div className="text-right">
              <div className="w-48 h-[1px] bg-slate-300 mb-2 ml-auto" />
              <p className="text-[10px] font-bold text-[#36454F] uppercase">Facility Manager Authorization</p>
           </div>
        </div>
      </motion.div>
    </div>
  );

  if (reportPreview) return <ReportPreviewDocument />;

  const IntelligenceFilterBar = () => (
    <motion.div 
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-2 px-4 shadow-sm flex flex-wrap items-center gap-3 mb-2"
    >
       <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
          <div className="p-1.5 rounded-lg bg-[#CE2029]/10 text-[#CE2029]"><Filter size={14} /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#36454F]">Filters</span>
       </div>
       
       <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1 px-3 bg-slate-50">
          <Calendar size={14} className="text-slate-400" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none p-0 cursor-pointer" />
          <span className="text-[10px] font-bold text-slate-400 opacity-50 px-1">—</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none p-0 cursor-pointer" />
       </div>

       <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1 px-3 bg-slate-50 h-[32px]">
          <MapPin size={14} className="text-slate-400" />
          <select value={location} onChange={e => setLocation(e.target.value)} className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none cursor-pointer pr-2">
             <option>AMM Sports Arena</option>
          </select>
       </div>

       <div className="hidden lg:flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 border border-green-100">
             <CheckCircle2 size={12} />
             <span className="text-[9px] font-bold uppercase tracking-widest">Cross-Module Feed Active</span>
          </div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest pl-2">Last Sync: Just Now</div>
       </div>
    </motion.div>
  );

  return (
    <div className="bg-[#F4F7F6] min-h-full font-sans print:bg-white overflow-hidden">
      <IntelligenceFilterBar />
      
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight flex items-center gap-3 text-[#36454F]">
              <PieChart className="text-[#CE2029]" size={24} strokeWidth={2} /> Financial Analytics
            </h2>
            <p className="text-xs md:text-sm mt-1 font-semibold text-slate-500 flex items-center gap-2">
              <Clock size={14} /> Operations Ledger for <span className="text-[#CE2029]">{location}</span>
            </p>
          </div>
          <button onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#CE2029] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm hover:translate-y-[-1px] transition-all">
            <Download size={16} strokeWidth={2.5} /> Export Audit
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#CE2029] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:text-[#CE2029]'
              }`}>
              <tab.icon size={13} strokeWidth={2} /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-[#36454F] text-[15px] uppercase tracking-widest flex items-center gap-2">
                           <TrendingUp size={16} className="text-[#CE2029]" /> Revenue Velocity
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Modular Performance Trend</p>
                      </div>
                      <div className="flex gap-1">
                        {['Weekly', 'Monthly'].map(r => (
                          <button key={r} onClick={() => setRangeFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                              rangeFilter === r ? 'bg-[#CE2029]/10 text-[#CE2029] border-[#CE2029]/20' : 'text-slate-400 border-transparent hover:text-slate-600'
                            }`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyRevenue} barSize={10} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} dy={8} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 10, fontWeight: 700 }} />
                          <Bar dataKey="courts" name="Courts" fill="#CE2029" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="coaching" name="Coaching" fill="#36454F" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="membership" name="Memberships" fill="#4287f5" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="retail" name="Retail" fill="#E88E3E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-[#36454F] text-[15px] uppercase tracking-widest mb-1">Revenue Composition</h3>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-6">Load Split %</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={revenueBySource} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                            {revenueBySource.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {revenueBySource.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-slate-500">{item.name}</span>
                           </div>
                           <span className="text-[#36454F]">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#36454F] rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center border border-white/5">
                   <div className="relative z-10 md:w-1/3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CE2029]/20 text-[#CE2029] rounded-full border border-[#CE2029]/30 mb-4 text-[9px] font-bold uppercase tracking-widest">
                         <Layers size={12} /> Optimization Node
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 uppercase leading-tight">Event Revenue Lift</h3>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Correlation between major tournaments and retail spend lift across facility nodes.</p>
                   </div>
                   <div className="flex-1 w-full h-[180px] bg-white/5 rounded-2xl p-4 border border-white/10">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={correlationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                            <Line type="monotone" dataKey="retail" stroke="#CE2029" strokeWidth={3} dot={{ r: 4, fill: '#CE2029' }} />
                            <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'courts' && (
              <div className="space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asset View:</span>
                    <select value={selectedCourt} onChange={e => setSelectedCourt(e.target.value)} className="bg-slate-50 px-3 py-2 rounded-xl text-[11px] font-bold uppercase outline-none border border-slate-200">
                       <option>All Courts</option>
                       {courtUtilization.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-[#36454F] mb-6 border-l-4 border-[#CE2029] pl-3">Court Occupancy Ledger</h3>
                    <div className="space-y-6">
                       {courtUtilization.filter(c => selectedCourt === 'All Courts' || c.name === selectedCourt).map((court, i) => (
                         <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-xs font-bold text-[#36454F] uppercase">{court.name}</span>
                               <div className="flex gap-6">
                                  <span className="text-[10px] font-semibold text-slate-400 uppercase">OMR {court.revenue}</span>
                                  <span className="text-xs font-bold text-[#CE2029]">{court.utilization}%</span>
                               </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${court.utilization}%` }} className="h-full bg-[#CE2029] rounded-full" />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'coaching' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                 <h3 className="text-[15px] font-bold uppercase tracking-widest mb-8 border-l-4 border-[#CE2029] pl-3">Academy Batch Performance</h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={coachingRevenue}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                          <Bar dataKey="morning" name="Morning" fill="#CE2029" stackId="a" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="evening" name="Evening" fill="#36454F" stackId="a" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            )}

            {activeTab === 'membership' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Membership Earned</h4>
                      <p className="text-3xl font-black text-[#36454F]">7,620<span className="text-[14px] text-slate-400 ml-1">OMR</span></p>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded-sm">
                         <TrendingUp size={12} /> +12.4% vs last month
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Premium Members</h4>
                      <p className="text-3xl font-black text-[#CE2029]">142</p>
                      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Across all hubs</p>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Conversion Rate</h4>
                      <p className="text-3xl font-black text-[#64748b]">18.5%</p>
                      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trial to paid</p>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 overflow-hidden font-sans">
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-[#CE2029]/10 text-[#CE2029] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#CE2029]/20">
                      {isGenerating ? <CloudUpload className="animate-bounce" /> : <Download size={28} />}
                   </div>
                   <h3 className="text-xl font-bold uppercase text-[#36454F] tracking-tight">Audit Statement Export</h3>
                   <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">Compiling consolidated facility records</p>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Fiscal Period</span>
                      <span className="text-[11px] font-bold text-[#36454F] uppercase">Mar 2026</span>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Integrity Mode</span>
                      <span className="text-[11px] font-bold text-[#CE2029] uppercase tracking-widest italic">Encrypted PDF</span>
                   </div>
                </div>

                <button 
                  onClick={handleGenerateReport} disabled={isGenerating}
                  className="w-full h-14 bg-[#CE2029] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl hover:shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? 'Synthesizing Audit Cluster...' : 'Download Audited PDF'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'courts', label: 'Courts', icon: Building2 },
  { id: 'coaching', label: 'Coaching', icon: GraduationCap },
  { id: 'membership', label: 'Memberships', icon: Crown },
  { id: 'retail', label: 'POS & Events', icon: ShoppingBag },
  { id: 'outstanding', label: 'Ledger', icon: FileText },
];

export default FinancialReports;
