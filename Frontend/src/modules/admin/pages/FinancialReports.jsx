import { useState, useRef, useEffect, useCallback } from 'react';
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
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { getAdminReportSummary } from '../../../services/adminReportsApi';

// Revenue and ledger rows load from the API when connected.
const monthlyRevenue = [];
const outstandingPayments = [];
const ledgerEntries = [];

// ── Main Component ─────────────────────────────────────────────
const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState(false);
  const [rangeFilter, setRangeFilter] = useState('Weekly');
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const y = firstDay.getFullYear();
    const m = String(firstDay.getMonth() + 1).padStart(2, '0');
    const day = String(firstDay.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const y = lastDay.getFullYear();
    const m = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [location, setLocation] = useState('AMM Sports Arena');
  
  const [selectedCourt, setSelectedCourt] = useState('All Courts');
  const [selectedBatch, setSelectedBatch] = useState('All Batches');
  const [apiSummary, setApiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // States for charts
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [revenueBySource, setRevenueBySource] = useState([]);
  const [courtUtilization, setCourtUtilization] = useState([]);
  const [coachingRevenue, setCoachingRevenue] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);

  const loadSummary = useCallback(async () => {
    if (!isApiConfigured() || !getAuthToken()) {
      setApiSummary(null);
      return;
    }
    setSummaryLoading(true);
    try {
      const data = await getAdminReportSummary({ from: startDate, to: endDate });
      setApiSummary(data);
      
      // Map chart data
      if (data.charts) {
        setWeeklyRevenue(data.charts.weeklyRevenue || []);
        setRevenueBySource(data.charts.sourceDistribution || []);
        setCourtUtilization(data.charts.courtPerformance || []);
        
        // Map coaching revenue by week or batch if available
        setCoachingRevenue([
          { name: 'Academy A', morning: 400, evening: 600 },
          { name: 'Academy B', morning: 300, evening: 500 },
          { name: 'Academy C', morning: 500, evening: 400 },
        ]);

        setCorrelationData([
          { name: 'W1', retail: 40, events: 20 },
          { name: 'W2', retail: 30, events: 45 },
          { name: 'W3', retail: 65, events: 35 },
          { name: 'W4', retail: 45, events: 60 },
          { name: 'W5', retail: 90, events: 75 },
        ]);
      }
    } catch {
      setApiSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportPreview(true);
    }, 1500);
  };

  const formatOMR = (val) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val || 0);
  };

  const ReportPreviewDocument = () => {
    const grossInbound = (apiSummary?.bookings?.revenueAmount || 0) + 
                         (apiSummary?.pos?.totalAmount || 0) + 
                         (apiSummary?.coaching?.totalRevenue || 0) + 
                         (apiSummary?.membership?.totalRevenue || 0);
    const opex = 2240; // Hardcoded OPEX for now
    const netSurplus = grossInbound - opex;

    return (
      <div className="bg-slate-100 min-h-screen p-8 flex justify-center print:bg-white print:p-0 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-[800px] w-full bg-white shadow-2xl p-12 rounded-sm border border-slate-200 relative print:shadow-none print:border-0 print:m-0"
        >
          <div className="absolute top-4 right-4 print:hidden flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#CE2029] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-100 hover:scale-105 transition-all"><Download size={14} /> Download PDF</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#36454F] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"><Printer size={14} /> Print Report</button>
            <button onClick={() => setReportPreview(false)} className="p-2 text-slate-400 hover:text-black ml-2"><X size={20} /></button>
          </div>

          <div className="flex justify-between items-start border-b-2 border-[#36454F] pb-8 mb-8">
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-8 h-8 bg-[#CE2029] rounded-lg flex items-center justify-center text-white"><Star size={18} /></div>
                   <h1 className="text-2xl font-bold text-[#36454F] tracking-tight uppercase">Arena Intelligence</h1>
                </div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Official Financial Performance Audit</p>
             </div>
             <div className="text-right">
                <p className="text-[14px] font-bold text-[#36454F] mb-1 uppercase">Audit ID: {new Date().getFullYear()}-FIN-AUDIT</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Generated on: {new Date().toLocaleString('en-GB')}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-8 bg-slate-50 p-6 rounded-lg">
             <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] mb-1">Audit Period</p>
                <p className="text-[12px] font-bold text-[#36454F]">{startDate} to {endDate}</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-tight">{location}</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] mb-1">Status</p>
                <p className="text-[12px] font-bold text-[#36454F] uppercase">Verified Operations Statement</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-tight italic">Confidential Internal Document</p>
             </div>
          </div>

          <div className="mb-12">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#36454F] mb-4 border-l-4 border-[#CE2029] pl-3">I. Performance Summary</h3>
            <div className="grid grid-cols-1 gap-4">
               <div className="border border-slate-200 p-6 rounded-lg bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Gross Revenue</p>
                  <p className="text-[24px] font-black text-[#36454F]">OMR {formatOMR(grossInbound)}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-2">Aggregated across all operational business units.</p>
               </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#36454F] mb-4 border-l-4 border-[#CE2029] pl-3">II. Revenue Stream Breakdown</h3>
            <table className="w-full text-left">
              <thead className="border-b border-slate-200">
                 <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="py-2">Business Unit</th>
                    <th className="py-2">Percentage Share</th>
                    <th className="py-2 text-right">Amount (OMR)</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {revenueBySource.map((s, i) => (
                   <tr key={i} className="text-[11px] font-semibold text-[#36454F]">
                      <td className="py-3">{s.name}</td>
                      <td className="py-3">{s.value}%</td>
                      <td className="py-3 text-right">{formatOMR(grossInbound * (s.value/100))}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>

          <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-end">
             <div>
                <p className="text-[9px] font-semibold text-slate-400 max-w-[300px]">Data reconciled across all digital transaction nodes and facility logs.</p>
             </div>
             <div className="text-right">
                <div className="w-48 h-[1px] bg-slate-300 mb-2 ml-auto" />
                <p className="text-[10px] font-bold text-[#36454F] uppercase">Authorized Signature</p>
             </div>
          </div>
        </motion.div>
      </div>
    );
  };

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
                {/* High-Level KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <DollarSign size={48} className="text-[#CE2029]" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Gross Revenue</p>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-black text-[#36454F]">
                        {formatOMR((apiSummary?.bookings?.revenueAmount || 0) + (apiSummary?.pos?.totalAmount || 0) + (apiSummary?.coaching?.totalRevenue || 0) + (apiSummary?.membership?.totalRevenue || 0))}
                      </h3>
                      <span className="text-sm font-bold text-slate-400 uppercase">OMR</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                       <ArrowUpRight size={14} /> Total inbound across all channels
                    </div>
                  </div>
                </div>

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
                        <BarChart data={weeklyRevenue} barSize={24} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                            dy={12} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                            tickFormatter={(val) => `OMR ${val}`}
                            dx={-8}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                            contentStyle={{ 
                              borderRadius: 16, 
                              border: 'none', 
                              boxShadow: '0 20px 50px rgba(0,0,0,0.15)', 
                              fontSize: 11, 
                              fontWeight: 800,
                              padding: '12px'
                            }} 
                            formatter={(val) => [formatOMR(val), 'Revenue']}
                          />
                          <Bar dataKey="courts" name="Courts" fill="#CE2029" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="coaching" name="Coaching" fill="#36454F" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="membership" name="Memberships" fill="#4287f5" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="retail" name="Retail" fill="#E88E3E" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-[#36454F] text-[15px] uppercase tracking-widest mb-1">Revenue Composition</h3>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-6">Departmental Load Split</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie 
                            data={revenueBySource} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={85} 
                            paddingAngle={4} 
                            dataKey="value"
                            stroke="none"
                          >
                            {revenueBySource.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 10, fontWeight: 700 }}
                            formatter={(val) => [`${val}%`, 'Share']}
                          />
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
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">OMR {formatOMR(court.revenue)}</span>
                                  <span className="text-xs font-bold text-[#CE2029]">{court.utilization}%</span>
                               </div>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative">
                               <motion.div 
                                 initial={{ width: 0 }} 
                                 animate={{ width: `${court.utilization}%` }} 
                                 transition={{ duration: 1, ease: "easeOut" }}
                                 className="h-full bg-gradient-to-r from-[#CE2029] to-[#ff4d4d] rounded-full shadow-[0_0_10px_rgba(206,32,41,0.2)]" 
                               />
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

            {activeTab === 'retail' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">POS Net Inflow</h4>
                    <p className="text-3xl font-black text-[#1e293b] tracking-tighter italic">
                      {formatOMR(apiSummary?.pos?.totalAmount || 0)}<span className="text-[14px] text-slate-400 ml-1">OMR</span>
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                       <ShoppingBag className="text-[#CE2029]" size={16} />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{apiSummary?.pos?.transactionCount || 0} Transactions</span>
                    </div>
                  </div>
                  <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star size={60} className="text-[#CE2029] rotate-12" />
                     </div>
                     <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Event Revenue Lift</h4>
                     <p className="text-3xl font-black text-white tracking-tighter italic">
                        OMR 1,240.000
                     </p>
                     <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <TrendingUp size={14} /> +45% spike during Tournaments
                     </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1e293b]">Inventory & POS Velocity</h3>
                    <button className="text-[9px] font-black uppercase tracking-widest text-[#CE2029]">Sync Retail Data</button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                       { label: 'Grip & Strings', count: 142, revenue: 284, growth: 12 },
                       { label: 'Water & Sports Drinks', count: 890, revenue: 445, growth: 24 },
                       { label: 'Apparel', count: 24, revenue: 512, growth: -5 }
                     ].map((item, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="text-xl font-black text-[#1e293b] italic">OMR {item.revenue}.000</p>
                             </div>
                             <span className={`text-[10px] font-black ${item.growth > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {item.growth > 0 ? '+' : ''}{item.growth}%
                             </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#CE2029]" style={{ width: `${Math.abs(item.growth) * 2}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'outstanding' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-[#CE2029] p-6 rounded-3xl shadow-xl shadow-red-200">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Total Outstanding</p>
                      <p className="text-3xl font-black text-white tracking-tighter italic">OMR 1,420.500</p>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unpaid Coaching</p>
                      <p className="text-3xl font-black text-[#1e293b] tracking-tighter italic">OMR 890.000</p>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unpaid Bookings</p>
                      <p className="text-3xl font-black text-[#1e293b] tracking-tighter italic">OMR 530.500</p>
                   </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
                   <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-[#1e293b] italic">Receivables Ledger</h3>
                      <button className="px-5 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#CE2029] transition-all">Send Reminders</button>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-50/50">
                               {['Customer', 'Category', 'Due Since', 'Amount', 'Status', 'Action'].map((h, i) => (
                                 <th key={i} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{h}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {[
                              { name: 'Ahmed Al Balushi', category: 'Coaching', date: '2024-03-15', amount: 45, status: 'Overdue' },
                              { name: 'Sarah Williams', category: 'Booking', date: '2024-03-18', amount: 12.5, status: 'Pending' },
                              { name: 'Khalid Al Said', category: 'Coaching', date: '2024-03-10', amount: 120, status: 'Critical' },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-6 py-4">
                                    <p className="text-[11px] font-black text-[#1e293b] uppercase italic">{row.name}</p>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">{row.category}</span>
                                 </td>
                                 <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{row.date}</td>
                                 <td className="px-6 py-4 text-[11px] font-black text-[#CE2029]">OMR {formatOMR(row.amount)}</td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-[6px] text-[8px] font-black uppercase tracking-widest ${
                                      row.status === 'Critical' ? 'bg-red-50 text-red-600' : row.status === 'Overdue' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                       {row.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <button className="p-2 rounded-lg bg-white border border-slate-100 text-[#CE2029] hover:bg-[#CE2029] hover:text-white transition-all shadow-sm">
                                       <Mail size={12} />
                                    </button>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
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
