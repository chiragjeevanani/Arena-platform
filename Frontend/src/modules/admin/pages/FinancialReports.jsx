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
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <PieChart className="text-[#22FF88] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Capital
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Income pulse.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button
             onClick={() => setShowExportModal(true)}
             className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#22FF88]/20"
           >
              <Download size={14} /> Settlement
           </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Gross', value: '₹1.24 Cr', change: '+24.5%', icon: DollarSign, color: '#22FF88' },
          { label: 'OPEX', value: '₹22.40 L', change: '-2.1%', icon: Wallet, color: '#FF4B4B' },
          { label: 'Net', value: '₹1.02 Cr', change: '+28.2%', icon: BarChart3, color: '#1EE7FF' },
          { label: 'Asset', value: '₹8.40 Cr', change: '+5.0%', icon: TrendingUp, color: '#FFD600' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-2.5 md:p-5 rounded-xl md:rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
            <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-2xl flex items-center justify-center mb-1.5 md:mb-4 border transition-colors duration-300`} style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={10} className="md:w-[20px] md:h-[20px]" />
            </div>
            <p className={`text-[6px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>{stat.label}</p>
            <h3 className={`text-[10px] md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</h3>
            <div className={`flex items-center gap-1 mt-1 text-[7px] md:text-[10px] font-black ${stat.change.startsWith('+') ? 'text-[#22FF88]' : 'text-[#FF4B4B]'}`}>
               {stat.change.startsWith('+') ? <ArrowUpRight size={8} /> : <ArrowDownLeft size={8} />}
               {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className={`lg:col-span-2 p-3 md:p-8 rounded-xl md:rounded-[2.5rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3 md:mb-8">
             <div>
                <h3 className={`font-black font-display uppercase tracking-widest text-[8px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Velocity</h3>
                <p className="text-[6px] md:text-[10px] font-black text-white/10 uppercase tracking-widest italic">Live Flow</p>
             </div>
             <select className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border outline-none ${isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-black/5 border-black/10 text-black/40 shadow-sm'}`}>
                <option>Units</option>
                <option>Global</option>
             </select>
          </div>
          <div className="h-[140px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22FF88" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22FF88" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(10,31,68,0.03)"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,31,68,0.1)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,31,68,0.1)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#08142B' : '#fff', border: '1px solid rgba(34,255,136,0.1)', borderRadius: '12px', fontSize: '8px', fontWeight: 900 }}
                  itemStyle={{ color: '#22FF88' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22FF88" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="coaching" stroke="#1EE7FF" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
           <h3 className={`font-black font-display uppercase tracking-widest text-[10px] md:text-sm mb-4 md:mb-6 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Trust</h3>
           <div className="space-y-5 md:space-y-6 text-[10px]">
              {[
                { label: 'GST Coll', value: '₹14.40L', color: '#1EE7FF' },
                { label: 'ITC Avail', value: '₹4.12L', color: '#22FF88' },
                { label: 'TDS Res', value: '₹56.1K', color: '#FFD600' },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                   <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[7px] md:text-[10px] font-black text-white/20 uppercase tracking-widest">{item.label}</span>
                      <span className={`text-[10px] md:text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.value}</span>
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

           <div className={`mt-6 md:mt-10 p-2.5 md:p-4 rounded-lg md:rounded-2xl border flex items-center justify-between group cursor-pointer transition-all ${isDark ? 'bg-white/2 border-white/5 hover:bg-white/5' : 'bg-black/2 border-black/5 hover:bg-black/5'}`}>
              <div className="flex items-center gap-2 md:gap-3">
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                    <CreditCard size={12} className="md:w-[18px] md:h-[18px]" />
                 </div>
                 <div>
                    <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Tax IDs</p>
                    <p className="text-[7px] md:text-[9px] font-black text-[#22FF88] uppercase italic">Verified</p>
                 </div>
              </div>
              <ChevronRight size={12} className="text-white/10 group-hover:text-white transition-colors" />
           </div>
        </div>
      </div>

      {/* Transaction Log Peek */}
      <div className={`p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
         <div className="flex items-center justify-between mb-3 md:mb-6">
            <h3 className={`font-black font-display uppercase tracking-widest text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Ledger</h3>
            <button className="text-[7px] md:text-[10px] font-black text-[#22FF88] uppercase tracking-widest italic hover:underline">Full Audit</button>
         </div>
         <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 md:p-4 rounded-lg md:rounded-2xl border transition-colors ${isDark ? 'bg-white/2 border-white/5 hover:bg-white/5' : 'bg-[#0A1F44]/2 border-[#0A1F44]/5 hover:bg-[#0A1F44]/5'}`}>
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center border text-[#1EE7FF] ${isDark ? 'bg-[#1EE7FF]/10 border-[#1EE7FF]/10' : 'bg-[#1EE7FF]/10 border-[#1EE7FF]/20'}`}>
                       <Receipt size={12} className="md:w-[18px] md:h-[18px]" />
                    </div>
                    <div>
                       <p className={`text-[9px] md:text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{i % 2 === 0 ? 'Operation' : 'Academy'}</p>
                       <p className="text-[7px] md:text-[10px] font-black text-white/10 uppercase tracking-widest">TR-{i}XN</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-[10px] md:text-sm font-black font-display ${i % 2 === 0 ? 'text-[#FF4B4B]' : 'text-[#22FF88]'}`}>{i % 2 === 0 ? '-' : '+'}₹8.2K</p>
                    <p className="text-[7px] md:text-[9px] font-black text-white/10 uppercase tracking-widest italic">12 Mar</p>
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
              className={`relative w-full max-w-lg rounded-3xl md:rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-6 md:p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3">
                    <FileText className="text-[#22FF88] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Statement
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">Export financial report</p>
                </div>
                <button onClick={() => setShowExportModal(false)} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}>
                  <X size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-5">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">From</label>
                    <input type="date" className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`} />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">To</label>
                    <input type="date" className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Scope</label>
                    <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                      <option>Arenas</option>
                      <option>Olympic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Format</label>
                    <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                      <option>PDF</option>
                      <option>CSV</option>
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Recipients</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all" />
                    <input type="email" placeholder="finance@arena.com" className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#22FF88] text-[#0A1F44] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#22FF88]/20 flex items-center justify-center gap-2"
                >
                  Generate & Send <Download size={14} className="md:w-[16px] md:h-[16px]" />
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
