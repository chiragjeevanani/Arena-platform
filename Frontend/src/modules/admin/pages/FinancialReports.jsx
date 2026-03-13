import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Download, Calendar, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, CreditCard, Filter, ChevronRight, TrendingUp, BarChart3, Receipt, X, ArrowRight, Mail, FileText } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, bookings: 24, coaching: 1200 },
  { name: 'Tue', revenue: 3000, bookings: 13, coaching: 980 },
  { name: 'Wed', revenue: 2000, bookings: 98, coaching: 2400 },
  { name: 'Thu', revenue: 2780, bookings: 39, coaching: 1700 },
  { name: 'Fri', revenue: 1890, bookings: 48, coaching: 1100 },
  { name: 'Sat', revenue: 5390, bookings: 120, coaching: 3800 },
  { name: 'Sun', revenue: 6490, bookings: 156, coaching: 4300 },
];

const FinancialReports = () => {
  const { isDark } = useTheme();
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <PieChart className="text-[#22FF88]" /> Financial Hub
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium italic">Income tracking, automated reconciliation, and ROI analytics.</p>
        </div>
        <div className="flex gap-2">
           <button
             onClick={() => setShowExportModal(true)}
             className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
           >
              <Download size={16} /> Monthly Statement
           </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Profit', value: '₹1.24 Cr', change: '+24.5%', icon: DollarSign, color: '#22FF88' },
          { label: 'OPEX Cost', value: '₹22.40 Lakh', change: '-2.1%', icon: Wallet, color: '#FF4B4B' },
          { label: 'Net Income', value: '₹1.02 Cr', change: '+28.2%', icon: BarChart3, color: '#1EE7FF' },
          { label: 'Arena Value', value: '₹8.40 Cr', change: '+5.0%', icon: TrendingUp, color: '#FFD600' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border transition-colors duration-300`} style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</h3>
            <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-black ${stat.change.startsWith('+') ? 'text-[#22FF88]' : 'text-[#FF4B4B]'}`}>
               {stat.change.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
               {stat.change} <span className="text-white/20">this month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-[2.5rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Revenue Stream Velocity</h3>
                <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-widest">Year-to-date Comparison</p>
             </div>
             <select className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
                <option>All Arenas</option>
                <option>Olympic Smash</option>
                <option>Badminton Hub</option>
             </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22FF88" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22FF88" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(10,31,68,0.05)"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,31,68,0.3)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,31,68,0.3)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#08142B' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                  itemStyle={{ color: '#22FF88', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22FF88" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="coaching" stroke="#1EE7FF" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
           <h3 className={`font-black font-display uppercase tracking-widest text-sm mb-6 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Tax & Compliance</h3>
           <div className="space-y-6">
              {[
                { label: 'GST (18%) Collected', value: '₹14,40,281', color: '#1EE7FF' },
                { label: 'GST (18%) Paid', value: '₹4,12,092', color: '#22FF88' },
                { label: 'TDS (Section 194C)', value: '₹56,102', color: '#FFD600' },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.label}</span>
                      <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.value}</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 60 + 20}%` }}
                        transition={{ duration: 1.5, delay: idx * 0.2 }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: item.color }} 
                      />
                   </div>
                </div>
              ))}
           </div>

           <div className={`mt-10 p-4 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                    <CreditCard size={18} />
                 </div>
                 <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Tax Filing Status</p>
                    <p className="text-[9px] font-bold text-[#22FF88] uppercase mt-0.5">Q1 Compliant</p>
                 </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
           </div>
        </div>
      </div>

      {/* Transaction Log Peek */}
      <div className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
         <div className="flex items-center justify-between mb-6">
            <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Recent Financial Ledger</h3>
            <button className="text-[10px] font-black text-[#22FF88] uppercase tracking-[0.2em] hover:underline">View All Entries</button>
         </div>
         <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isDark ? 'bg-white/2 border-white/5 hover:bg-white/5' : 'bg-[#0A1F44]/2 border-[#0A1F44]/5 hover:bg-[#0A1F44]/5'}`}>
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-[#1EE7FF] ${isDark ? 'bg-[#1EE7FF]/10 border-[#1EE7FF]/20' : 'bg-[#1EE7FF]/20 border-[#1EE7FF]/40'}`}>
                       <Receipt size={18} />
                    </div>
                    <div>
                       <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{i % 2 === 0 ? 'Arena Lighting OPEX' : 'Academy Membership Revenue'}</p>
                       <p className="text-[10px] font-bold text-white/30 uppercase mt-0.5">Reference ID: TXN-0928{i}L</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-sm font-black font-display ${i % 2 === 0 ? 'text-[#FF4B4B]' : 'text-[#22FF88]'}`}>{i % 2 === 0 ? '-' : '+'}₹8,250.00</p>
                    <p className="text-[9px] font-bold text-white/20 uppercase mt-0.5">12 Mar 2026</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Export Statement Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <FileText className="text-[#22FF88]" /> Export Statement
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Generate and export financial report</p>
                </div>
                <button onClick={() => setShowExportModal(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">From Date</label>
                    <input type="date" className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">To Date</label>
                    <input type="date" className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Arena Scope</label>
                    <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                      <option>All Arenas</option>
                      <option>Olympic Smash</option>
                      <option>Badminton Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Export Format</label>
                    <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                      <option>PDF</option>
                      <option>Excel (.xlsx)</option>
                      <option>CSV</option>
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Email Recipients</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all" />
                    <input type="email" placeholder="finance@arena.com, cfo@arena.com" className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#22FF88] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#22FF88]/20 flex items-center justify-center gap-2"
                >
                  Generate & Send Report <Download size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialReports;
