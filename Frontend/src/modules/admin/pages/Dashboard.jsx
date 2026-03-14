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
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3">
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Ops Center</h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Analytics live.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={selectedArena}
            onChange={(e) => setSelectedArena(e.target.value)}
            disabled={isLoading || isArenaAdmin}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg md:rounded-xl border transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none ${
              isDark ? 'border-white/10 bg-white/5 text-white' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44] shadow-sm'
            } ${isLoading || isArenaAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!isArenaAdmin && <option value="all">Network</option>}
            {MOCK_DB.arenas
              .filter(a => !isArenaAdmin || a.id === user.assignedArena)
              .map(a => (
                <option key={a.id} value={a.id}>{a.name.split(' ')[0]}</option>
              ))}
          </select>
          <button 
            onClick={() => setSelectedArena('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg md:rounded-xl border transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
            isDark ? 'border-white/10 bg-white/5 text-white' : 'border-[#0A1F44]/10 bg-white text-[#0A1F44] shadow-sm'
          }`}>
            <RefreshCw size={12} className={`text-[#22FF88] ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group relative border transition-all duration-300 ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 rounded-xl md:rounded-[2rem] p-3 md:p-6 hover:border-[#22FF88]/30' 
                : 'bg-white border-[#0A1F44]/10 rounded-xl md:rounded-[2rem] p-3 md:p-6 shadow-sm hover:border-[#22FF88]'
            }`}
          >
             {isLoading ? <div className="h-16 md:h-20 bg-white/5 animate-pulse rounded-lg" /> : (
               <>
                 <div className="flex justify-between items-start mb-2 md:mb-6">
                    <div className={`w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center transition-all ${
                      isDark 
                        ? 'bg-white/5 text-white/40 group-hover:text-[#22FF88]' 
                        : 'bg-[#0A1F44]/5 text-[#0A1F44]/40 group-hover:text-[#22FF88]'
                    }`}>
                      <stat.icon size={14} className="md:w-[20px] md:h-[20px]" />
                    </div>
                    <div className={`flex items-center gap-0.5 text-[6px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border ${
                      stat.isUp 
                        ? 'text-[#22FF88] bg-[#22FF88]/5 border-[#22FF88]/20' 
                        : 'text-[#FF4B4B] bg-[#FF4B4B]/5 border-[#FF4B4B]/20'
                    }`}>
                      {stat.trend.split('%')[0]}% {stat.isUp && <ArrowUpRight size={8} />}
                    </div>
                </div>

                <div>
                  <h4 className={`text-[6px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>{stat.label.split(' ')[0]}</h4>
                  <p className={`text-sm md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</p>
                </div>
               </>
             )}
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`xl:col-span-2 rounded-xl md:rounded-[2.5rem] border p-4 md:p-8 ${
            isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'
          }`}
        >
          {isLoading ? <div className="h-48 md:h-72 bg-white/5 animate-pulse rounded-2xl" /> : (
            <>
              <div className="flex justify-between items-center mb-4 md:mb-10">
                <h3 className={`font-black font-display uppercase tracking-widest text-[9px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Revenue velocity</h3>
                <span className="text-[7px] md:text-[10px] font-black text-[#22FF88] border border-[#22FF88]/20 px-2 py-1 rounded-lg uppercase">Live</span>
              </div>
              <div className="h-40 md:h-72">
                 <RevenueChart />
              </div>
            </>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl md:rounded-[2.5rem] border p-4 md:p-8 flex flex-col ${
            isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'
          }`}
        >
          {isLoading ? <div className="h-48 md:h-72 bg-white/5 animate-pulse rounded-2xl" /> : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`font-black font-display uppercase tracking-widest text-[9px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Load</h3>
                  <p className="text-[7px] md:text-[10px] font-bold text-[#FFD600] uppercase tracking-widest mt-0.5">Arena avg</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                   <MapPin size={16} />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                 <span className="text-3xl md:text-5xl font-black font-display text-[#22FF88] mb-1">{currentStats.occupancy}%</span>
                 <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-white/20 uppercase">Utilization</p>
                 <div className="mt-4 md:mt-8 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl md:rounded-[2.5rem] border overflow-hidden ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'
        }`}
      >
        <div className={`px-4 md:px-8 py-3 md:py-6 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <h3 className={`font-black font-display uppercase tracking-widest text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Booking Queue</h3>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-4 space-y-3">
               <div className="h-10 bg-white/5 animate-pulse rounded-lg" />
               <div className="h-10 bg-white/5 animate-pulse rounded-lg" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                  <th className="p-3 md:p-6">ID</th>
                  <th className="p-3 md:p-6">Client</th>
                  <th className="p-3 md:p-6">Venue</th>
                  <th className="p-3 md:p-6">Value</th>
                  <th className="p-3 md:p-6 text-center">State</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
                {filteredBookings.map((bk) => {
                  const arena = MOCK_DB.arenas.find(a => a.id === bk.arenaId);
                  return (
                    <tr key={bk.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className={`p-3 md:p-6 text-[8px] md:text-[10px] font-black font-mono ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>#{bk.id}</td>
                      <td className="p-3 md:p-6">
                         <p className={`font-black tracking-tight text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{bk.customerName.split(' ')[0]}</p>
                         <p className="text-[6px] md:text-[8px] font-bold text-[#FFD600] uppercase tracking-widest opacity-40">Verified</p>
                      </td>
                      <td className={`p-3 md:p-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>{arena?.name.split(' ')[0]}</td>
                      <td className="p-3 md:p-6 text-[10px] md:text-sm font-black text-[#22FF88] font-display">₹{bk.amount}</td>
                      <td className="p-3 md:p-6">
                        <div className="flex items-center justify-center">
                           <span className={`px-2 py-0.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest border ${
                             bk.status === 'Confirmed' 
                               ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' 
                               : 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20'
                           }`}>
                             {bk.status === 'Confirmed' ? 'Live' : bk.status}
                           </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
      {!isLoading && filteredBookings.length === 0 && (
        <div className="p-12 text-center text-white/20 font-black uppercase tracking-widest text-xs">
          No active bookings for this scope
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
