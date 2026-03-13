import { motion } from 'framer-motion';
import { 
  ArrowUpRight, Users, CalendarDays, DollarSign, 
  TrendingUp, MapPin, Download, RefreshCw 
} from 'lucide-react';
import RevenueChart from '../components/RevenueChart';
import UtilizationHeatmap from '../components/UtilizationHeatmap';

import { useTheme } from '../../user/context/ThemeContext';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  
  const stats = [
    { label: 'Total Revenue', value: '₹1,24,500', icon: DollarSign, trend: '+12.5%', isUp: true },
    { label: 'Court Bookings', value: '845', icon: CalendarDays, trend: '+5.2%', isUp: true },
    { label: 'Active Users', value: '3,200', icon: Users, trend: '+18.1%', isUp: true },
    { label: 'Utilization Rate', value: '76%', icon: TrendingUp, trend: '-2.4%', isUp: false },
  ];

  const recentBookings = [
    { id: '#BK-0982', user: 'Rahul Verma', arena: 'Olympic Court', type: 'Casual', amount: '₹400', status: 'Confirmed' },
    { id: '#BK-0981', user: 'Ananya Sharma', arena: 'Badminton Hub', type: 'Coaching', amount: '₹3500', status: 'Confirmed' },
    { id: '#BK-0980', user: 'Vikram Singh', arena: 'Classic Shuttle', type: 'Tournament', amount: '₹1200', status: 'Pending' },
    { id: '#BK-0979', user: 'Priya Patel', arena: 'Olympic Court', type: 'Casual', amount: '₹800', status: 'Confirmed' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Arena Insight</h2>
          <p className="text-sm text-white/40 mt-1 font-medium italic">Command Center Overview • Mar 2026</p>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
            isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44] hover:bg-[#0A1F44]/5 shadow-sm'
          }`}>
            <RefreshCw size={14} className="text-[#22FF88]" />
            Reload Data
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-[#1EE7FF] transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#22FF88]/20">
            <Download size={14} />
            Export Analytics
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group relative border transition-all duration-300 ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 rounded-[2rem] p-6 hover:border-[#22FF88]/30' 
                : 'bg-white border-[#0A1F44]/10 rounded-[2rem] p-6 shadow-xl shadow-blue-500/5 hover:border-[#22FF88]'
            }`}
          >
             <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isDark 
                    ? 'bg-white/5 text-white/60 group-hover:text-[#22FF88] group-hover:bg-[#22FF88]/10' 
                    : 'bg-[#0A1F44]/5 text-[#0A1F44]/40 group-hover:text-[#22FF88] group-hover:bg-[#22FF88]/5'
                }`}>
                  <stat.icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                  stat.isUp 
                    ? 'text-[#22FF88] bg-[#22FF88]/5 border-[#22FF88]/20' 
                    : 'text-[#FF4B4B] bg-[#FF4B4B]/5 border-[#FF4B4B]/20'
                }`}>
                  {stat.trend} <ArrowUpRight size={12} className={!stat.isUp && 'rotate-90'} />
                </div>
             </div>

             <div>
               <h4 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h4>
               <p className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`xl:col-span-2 rounded-[2.5rem] border p-8 ${
            isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'
          }`}
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Revenue Stream Velocity</h3>
            <select className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl focus:outline-none transition-all ${
              isDark ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-[#0A1F44]/5 border border-black/5 text-[#0A1F44]'
            }`}>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72">
             <RevenueChart />
          </div>
        </motion.div>

        {/* Utilization Heatmap Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-[2.5rem] border p-8 flex flex-col ${
            isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'
          }`}
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Court Pulse</h3>
              <p className="text-[10px] font-bold text-[#FFD600] uppercase tracking-widest mt-1">Real-time Usage Feed</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
               <MapPin size={20} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
             <UtilizationHeatmap />
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`rounded-[2.5rem] border overflow-hidden ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'
        }`}
      >
        <div className={`px-8 py-6 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Live Booking Queue</h3>
          <button className="text-[10px] font-black text-[#1EE7FF] hover:text-[#22FF88] transition-colors uppercase tracking-[0.2em]">
            Export Full Ledger
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                <th className="p-6">Reference ID</th>
                <th className="p-6">Client Identity</th>
                <th className="p-6">Arena Scope</th>
                <th className="p-6">Booking Class</th>
                <th className="p-6">Value</th>
                <th className="p-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
              {recentBookings.map((bk, i) => (
                <tr key={bk.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className={`p-6 text-[10px] font-black font-mono ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>{bk.id}</td>
                  <td className="p-6">
                     <p className={`font-black tracking-tight text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{bk.user}</p>
                     <p className="text-[9px] font-bold text-[#FFD600] uppercase tracking-widest">Verified User</p>
                  </td>
                  <td className={`p-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>{bk.arena}</td>
                  <td className="p-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      isDark ? 'bg-white/5 text-white/70 border-white/10' : 'bg-[#0A1F44]/5 text-[#0A1F44]/70 border-[#0A1F44]/10'
                    }`}>
                      {bk.type}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-black text-[#22FF88] font-display tracking-tight">{bk.amount}</td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         bk.status === 'Confirmed' 
                           ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' 
                           : 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20'
                       }`}>
                         {bk.status}
                       </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};


export default AdminDashboard;
