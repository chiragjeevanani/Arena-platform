import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Download, Calendar, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, CreditCard, Filter, ChevronRight, TrendingUp, BarChart3, Receipt, X, ArrowRight, Mail, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, bookings: 24, coaching: 1200 },
  { name: 'Tue', revenue: 3000, bookings: 13, coaching: 980 },
  { name: 'Wed', revenue: 5000, bookings: 98, coaching: 2400 },
  { name: 'Thu', revenue: 2780, bookings: 39, coaching: 1700 },
  { name: 'Fri', revenue: 1890, bookings: 48, coaching: 1100 },
  { name: 'Sat', revenue: 6390, bookings: 120, coaching: 3800 },
  { name: 'Sun', revenue: 7490, bookings: 156, coaching: 4300 },
];

const FinancialReports = () => {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
              <PieChart className="text-[#eb483f]" size={24} strokeWidth={2.5} /> Financial Analytics
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Real-time revenue tracking and asset yields.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button
               onClick={() => setShowExportModal(true)}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-[11px] md:text-[13px] font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
             >
                <Download size={16} strokeWidth={3} /> Export Statements
             </button>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Gross Revenue', value: 'OMR 12,400.000', change: '+24.5%', icon: DollarSign, color: '#eb483f' },
            { label: 'OPEX / Costs', value: 'OMR 2,240.000', change: '-2.1%', icon: Wallet, color: '#ff6b6b' },
            { label: 'Net Profit', value: 'OMR 10,200.000', change: '+28.2%', icon: BarChart3, color: '#eb483f' },
            { label: 'Total Assets', value: 'OMR 84,000.000', change: '+5.0%', icon: TrendingUp, color: '#eb483f' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col justify-between transition-all hover:border-[#eb483f]/50 hover:shadow-md group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors group-hover:scale-110" style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black ${stat.change.startsWith('+') ? 'text-[#76A87A]' : 'text-[#ff6b6b]'}`}>
                   {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                   {stat.change}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-[#1a2b3c] tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Tax Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 transition-all hover:border-[#eb483f]/40">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#eb483f]" /> Revenue Velocity
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Weekly Performance Pulse</p>
               </div>
               <div className="flex gap-2">
                 {['Daily', 'Weekly', 'Monthly'].map((range) => (
                   <button key={range} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === 'Weekly' ? 'bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/20' : 'text-slate-400 hover:text-slate-600 border border-transparent'}`}>
                     {range}
                   </button>
                 ))}
               </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eb483f" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#eb483f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,43,60,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                    dy={12} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 800, color: '#1a2b3c' }}
                    itemStyle={{ color: '#eb483f' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#eb483f" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="coaching" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tax & Reconciliation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col justify-between transition-all hover:border-[#eb483f]/40">
             <div className="mb-6">
                <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest mb-6">Tax Reconciliation</h3>
                <div className="space-y-6">
                   {[
                     { label: 'Tax Collected', value: 'OMR 1,440.000', percent: 78, color: '#eb483f' },
                    { label: 'Credits Available', value: 'OMR 412.000', percent: 45, color: '#eb483f' },
                    { label: 'Reserves', value: 'OMR 56.100', percent: 25, color: '#eb483f' },
                   ].map((item, idx) => (
                     <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                           <span className="text-sm font-black text-[#1a2b3c]">{item.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${item.percent}%` }}
                             transition={{ duration: 1.5, delay: idx * 0.2 }}
                             className="h-full rounded-full" 
                             style={{ backgroundColor: item.color }} 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between group cursor-pointer transition-all hover:bg-white hover:shadow-md hover:border-[#eb483f]/20">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#eb483f] shadow-sm">
                      <CreditCard size={18} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-[11px] font-black text-[#1a2b3c] uppercase tracking-widest">Tax Identity</p>
                      <p className="text-[10px] font-bold text-[#eb483f] uppercase tracking-widest italic">Compliance OK</p>
                   </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-[#eb483f] transition-all" strokeWidth={3} />
             </div>
          </div>
        </div>

        {/* Recent Ledger Audit */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 transition-all hover:border-[#eb483f]/40">
           <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-[#1a2b3c] text-[15px] uppercase tracking-widest">Master Ledger</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Recent Operational Entries</p>
              </div>
              <button className="text-[11px] font-black text-[#eb483f] uppercase tracking-widest border-b-2 border-transparent hover:border-[#eb483f] transition-all">Full Audit Log</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'Operations', id: 'TR-1082XN', amount: '8,200', mode: 'Debit', date: '12 Mar 2026', color: '#ff6b6b' },
                { type: 'Academy Fees', id: 'TR-1081XN', amount: '12,500', mode: 'Credit', date: '12 Mar 2026', color: '#76A87A' },
                { type: 'POS Retail', id: 'TR-1080XN', amount: '4,100', mode: 'Credit', date: '11 Mar 2026', color: '#76A87A' },
                { type: 'Maintenance', id: 'TR-1079XN', amount: '15,000', mode: 'Debit', date: '11 Mar 2026', color: '#ff6b6b' },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-[#eb483f] shadow-sm transform group-hover:rotate-12 transition-transform">
                         <Receipt size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                         <p className="text-[13px] font-extrabold text-[#1a2b3c]">{tx.type}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.id}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black tracking-tight" style={{ color: tx.color }}>
                        {tx.mode === 'Debit' ? '-' : '+'}OMR {tx.amount.includes('.') ? Number(tx.amount.replace(/,/g, '')).toFixed(3) : Number(tx.amount.replace(/,/g, '')).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.date}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowExportModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2">
                      <FileText className="text-[#eb483f]" size={24} strokeWidth={3} /> Settlement List
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Export financial auditing report</p>
                  </div>
                  <button 
                    onClick={() => setShowExportModal(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 shadow-sm"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Date From</label>
                      <input type="date" className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Date To</label>
                      <input type="date" className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Data Scope</label>
                      <select className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                        <option>Global Business</option>
                        <option>Olympic Arena</option>
                        <option>Academy Only</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">File Format</label>
                      <select className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                        <option>Secure PDF</option>
                        <option>Spreadsheet (CSV)</option>
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Recipients</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-all" strokeWidth={2.5} />
                      <input type="email" placeholder="finance@arena.com" className="w-full py-3 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400" />
                    </div>
                  </div>

                  <button
                    onClick={() => setShowExportModal(false)}
                    className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#eb483f]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    Deploy Report <Download size={16} strokeWidth={3} />
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
