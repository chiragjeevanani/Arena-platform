import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Users, CalendarDays, DollarSign, 
  TrendingUp, MapPin, Download, RefreshCw, Layers 
} from 'lucide-react';
import RevenueChart from '../components/RevenueChart';
import UtilizationHeatmap from '../components/UtilizationHeatmap';
import Skeleton from '../../../components/Skeleton';

import { useTheme } from '../../user/context/ThemeContext';
import { useAuth } from '../../user/context/AuthContext';
import { MOCK_DB, getDashStats } from '../../../data/mockDatabase';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  // Scoping logic: ARENA_ADMIN only sees their assigned arena
  const isArenaAdmin = user?.role === 'ARENA_ADMIN';
  const initialArena = isArenaAdmin ? user.assignedArena : 'all';
  
  const [selectedArena, setSelectedArena] = useState(initialArena);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate data fetch delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedArena]);

  const currentStats = getDashStats(selectedArena);
  
  const stats = [
    { label: 'Total Revenue', value: `₹${currentStats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', isUp: true },
    { label: 'Bookings', value: currentStats.bookingCount, icon: CalendarDays, trend: '+5.2%', isUp: true },
    { label: 'Active Players', value: '3,200', icon: Users, trend: '+18.1%', isUp: true },
    { label: 'Inventory Alerts', value: currentStats.lowStockCount, icon: Layers, trend: 'Low Stock', isUp: currentStats.lowStockCount === 0 },
  ];

  const filteredBookings = selectedArena === 'all' 
    ? MOCK_DB.bookings 
    : MOCK_DB.bookings.filter(b => b.arenaId === selectedArena);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Command Center</h2>
          <p className="text-sm text-white/40 mt-1 font-medium italic">SaaS Performance Analytics • Real-time Data</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedArena}
            onChange={(e) => setSelectedArena(e.target.value)}
            disabled={isLoading || isArenaAdmin}
            className={`px-4 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-[#22FF88]/30 outline-none ${
              isDark ? 'border-white/10 bg-white/5 text-white shadow-xl' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44] shadow-sm'
            } ${isLoading || isArenaAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!isArenaAdmin && <option value="all">All Arenas</option>}
            {MOCK_DB.arenas
              .filter(a => !isArenaAdmin || a.id === user.assignedArena)
              .map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
          </select>
          <button 
            onClick={() => setSelectedArena('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
            isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44] hover:bg-[#0A1F44]/5 shadow-sm'
          }`}>
            <RefreshCw size={14} className={`text-[#22FF88] ${isLoading ? 'animate-spin' : ''}`} />
            Sync
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
             {isLoading ? <Skeleton height="80px" className="mb-4" /> : (
               <>
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
                      {stat.trend} {stat.isUp && <ArrowUpRight size={12} />}
                    </div>
                </div>

                <div>
                  <h4 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h4>
                  <p className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</p>
                </div>
               </>
             )}
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`xl:col-span-2 rounded-[2.5rem] border p-8 ${
            isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'
          }`}
        >
          {isLoading ? <Skeleton height="300px" /> : (
            <>
              <div className="flex justify-between items-center mb-10">
                <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Revenue Stream Velocity</h3>
                <span className="text-[10px] font-black text-[#22FF88] border border-[#22FF88]/20 px-3 py-1.5 rounded-lg uppercase tracking-widest">Live Flow</span>
              </div>
              <div className="h-72">
                 <RevenueChart />
              </div>
            </>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[2.5rem] border p-8 flex flex-col ${
            isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'
          }`}
        >
          {isLoading ? <Skeleton height="300px" /> : (
            <>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Occupancy</h3>
                  <p className="text-[10px] font-bold text-[#FFD600] uppercase tracking-widest mt-1">Arena Utilization</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                   <MapPin size={20} />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                 <span className="text-5xl font-black font-display text-[#22FF88] mb-2">{currentStats.occupancy}%</span>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Average Load</p>
                 <div className="mt-8 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentStats.occupancy}%` }}
                      className="h-full bg-gradient-to-r from-[#22FF88] to-[#1EE7FF]" 
                    />
                 </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2.5rem] border overflow-hidden ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'
        }`}
      >
        <div className={`px-8 py-6 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Live Booking Queue</h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
               <Skeleton height="40px" />
               <Skeleton height="40px" />
               <Skeleton height="40px" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                  <th className="p-6">Reference ID</th>
                  <th className="p-6">Client Identity</th>
                  <th className="p-6">Arena Scope</th>
                  <th className="p-6">Value</th>
                  <th className="p-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
                {filteredBookings.map((bk) => {
                  const arena = MOCK_DB.arenas.find(a => a.id === bk.arenaId);
                  return (
                    <tr key={bk.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className={`p-6 text-[10px] font-black font-mono ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>#{bk.id}</td>
                      <td className="p-6">
                         <p className={`font-black tracking-tight text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{bk.customerName}</p>
                         <p className="text-[9px] font-bold text-[#FFD600] uppercase tracking-widest">Verified User</p>
                      </td>
                      <td className={`p-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>{arena?.name}</td>
                      <td className="p-6 text-sm font-black text-[#22FF88] font-display tracking-tight">₹{bk.amount}</td>
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
                  );
                })}
              </tbody>
            </table>
          )}
          {!isLoading && filteredBookings.length === 0 && (
            <div className="p-12 text-center text-white/20 font-black uppercase tracking-widest text-xs">
              No active bookings for this scope
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
