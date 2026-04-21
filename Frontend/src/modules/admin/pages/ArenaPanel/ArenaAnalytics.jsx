import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import ArenaPanelDemoBanner from './ArenaPanelDemoBanner';

const COURT_REVENUE = [
  { name: 'Court 1', revenue: 450.500, occupancy: 85, bookings: 42 },
  { name: 'Court 2', revenue: 380.250, occupancy: 72, bookings: 38 },
  { name: 'Court 3', revenue: 520.000, occupancy: 92, bookings: 48 },
  { name: 'Court 4', revenue: 290.750, occupancy: 65, bookings: 25 },
  { name: 'Court 5', revenue: 310.000, occupancy: 68, bookings: 28 },
];

const ArenaAnalytics = () => {
  return (
    <div className="space-y-6">
      <ArenaPanelDemoBanner>
        Analytics are simulated on this prototype screen until wired to arena-admin APIs.
      </ArenaPanelDemoBanner>
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: 'OMR 1,951.500', trend: '+12.5%', icon: DollarSign, color: '#22c55e' },
          { label: 'Avg Occupancy', value: '76.4%', trend: '+5.2%', icon: Activity, color: '#6366f1' },
          { label: 'Total Bookings', value: '181', trend: '+18', icon: Users, color: '#CE2029' },
          { label: 'Top Court', value: 'Court 3', trend: 'OMR 520', icon: Target, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
            <p className="text-xl font-black text-[#36454F] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Court Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#36454F]">Revenue by Court</h3>
            <select className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none outline-none rounded-lg px-2 py-1">
              <option>Last 30 Days</option>
              <option>This Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COURT_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#36454F] p-3 rounded-xl shadow-xl border border-white/10">
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                          <p className="text-sm font-black text-white">OMR {payload[0].value.toFixed(3)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                  {COURT_REVENUE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#CE2029' : '#36454F'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#36454F] mb-6">Court Occupancy %</h3>
           <div className="space-y-5">
              {COURT_REVENUE.map((court, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{court.name}</span>
                    <span className="text-[10px] font-black text-[#36454F]">{court.occupancy}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${court.occupancy}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full rounded-full ${court.occupancy > 80 ? 'bg-green-500' : court.occupancy > 60 ? 'bg-[#6366f1]' : 'bg-[#f59e0b]'}`}
                    />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaAnalytics;
