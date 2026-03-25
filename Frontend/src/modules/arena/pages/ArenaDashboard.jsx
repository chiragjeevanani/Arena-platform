import { motion } from 'framer-motion';
import { Target, Clock, DollarSign, CalendarX2, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { label: 'Total Courts', value: '4', sub: '3 active now', icon: Target, color: '#eb483f', path: '/arena/courts' },
  { label: 'Today\'s Slots', value: '28', sub: '18 booked · 10 free', icon: Clock, color: '#6366f1', path: '/arena/slots' },
  { label: 'Revenue Today', value: '₹6,850', sub: '+12% vs yesterday', icon: DollarSign, color: '#22c55e', path: '/arena/pricing' },
  { label: 'Blocked Slots', value: '2', sub: '1 maintenance · 1 event', icon: CalendarX2, color: '#f59e0b', path: '/arena/availability' },
  { label: 'Active Bookings', value: '18', sub: 'For today', icon: TrendingUp, color: '#0ea5e9', path: '/arena/slots' },
  { label: 'Upcoming Classes', value: '3', sub: 'Coaching sessions', icon: Users, color: '#a855f7', path: '/arena/availability' },
];

const RECENT_ACTIVITY = [
  { type: 'booking', text: 'Court A booked for 7:00-8:00 PM', user: 'Rahul Sharma', time: '5 min ago', color: '#eb483f' },
  { type: 'block', text: 'Court C blocked for Maintenance', user: 'Arena Manager', time: '1 hr ago', color: '#f59e0b' },
  { type: 'pricing', text: 'Peak pricing enabled for evening', user: 'Arena Manager', time: '3 hr ago', color: '#22c55e' },
  { type: 'booking', text: 'Court B booked for 6:00-7:00 PM', user: 'Priya Patel', time: '4 hr ago', color: '#6366f1' },
  { type: 'slot', text: 'New weekend slots added (8)', user: 'Arena Manager', time: '1 day ago', color: '#0ea5e9' },
];

const COURT_STATUS = [
  { name: 'Court A', type: 'Indoor', status: 'Occupied', statusColor: '#eb483f', player: 'Rahul Sharma', until: '8:00 PM' },
  { name: 'Court B', type: 'Indoor', status: 'Available', statusColor: '#22c55e', player: null, until: null },
  { name: 'Court C', type: 'Outdoor', status: 'Maintenance', statusColor: '#f59e0b', player: null, until: '6:00 PM' },
  { name: 'Court D', type: 'Indoor', status: 'Available', statusColor: '#22c55e', player: null, until: null },
];

const ArenaDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 min-h-full">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#1a2b3c]">Good Evening 👋</h1>
        <p className="text-slate-500 font-medium mt-1">Here's your arena overview for today — Mar 24</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {STATS.map((stat, i) => (
          <motion.button key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => navigate(stat.path)}
            className="group bg-white hover:bg-slate-50 border border-slate-100 hover:border-[#eb483f]/30 rounded-2xl p-4 text-left transition-all shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 group-hover:bg-[#eb483f]/20 transition-colors" />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${stat.color}10` }}>
              <stat.icon size={17} style={{ color: stat.color }} strokeWidth={2.5} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-[#1a2b3c]">{stat.value}</p>
            <p className="text-[9px] font-bold text-slate-400 mt-1">{stat.sub}</p>
            <ArrowUpRight size={14} className="absolute top-4 right-4 text-slate-200 group-hover:text-[#eb483f] transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Court Status */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-[#1a2b3c]">Court Status</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Real-time court availability</p>
            </div>
            <button onClick={() => navigate('/arena/courts')}
              className="text-[10px] font-black uppercase tracking-widest text-[#eb483f] hover:underline flex items-center gap-1">
              Manage <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {COURT_STATUS.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Target size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-black text-[#1a2b3c] text-[13px]">{c.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                    style={{ color: c.statusColor, backgroundColor: `${c.statusColor}10`, borderColor: `${c.statusColor}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.statusColor }} />
                    {c.status}
                  </span>
                  {c.player && <p className="text-[9px] font-bold text-slate-400 mt-1">{c.player} · until {c.until}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-black text-[#1a2b3c]">Recent Activity</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Latest actions in your arena</p>
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-700 leading-snug">{a.text}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{a.user}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-300 shrink-0 mt-0.5">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaDashboard;
