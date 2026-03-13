import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Search, Download, Filter, MoreHorizontal, CheckCircle, Clock, XCircle, ArrowUpRight,
  Eye, CalendarRange, RefreshCw, Smartphone, Trash2, X
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const mockBookings = [
  { id: 'BK-1001', customer: 'Amit Sharma', court: 'Court 1', arena: 'Olympic Smash', date: '2026-03-12', time: '07:00 AM', amount: 800, status: 'Completed', payment: 'Paid' },
  { id: 'BK-1002', customer: 'Rajesh Kumar', court: 'Court 3', arena: 'Olympic Smash', date: '2026-03-12', time: '09:00 AM', amount: 800, status: 'Upcoming', payment: 'Pending' },
  { id: 'BK-1003', customer: 'Sanya Mirza', court: 'Court 2', arena: 'Badminton Hub', date: '2026-03-12', time: '04:00 PM', amount: 1200, status: 'Upcoming', payment: 'Paid' },
  { id: 'BK-1004', customer: 'Vikram Singh', court: 'Court 1', arena: 'Olympic Smash', date: '2026-03-12', time: '05:00 PM', amount: 800, status: 'Cancelled', payment: 'Refunded' },
  { id: 'BK-1005', customer: 'Neha Malik', court: 'Court 4', arena: 'Badminton Hub', date: '2026-03-13', time: '06:00 AM', amount: 950, status: 'Upcoming', payment: 'Paid' },
];

const Bookings = () => {
  const { isDark } = useTheme();
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBookings = mockBookings.filter(booking => {
     const matchesSearch = booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.id.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
     return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Court', 'Arena', 'Date', 'Time', 'Amount (₹)', 'Status', 'Payment'];
    const rows = mockBookings.map(bk => [
      bk.id,
      bk.customer,
      bk.court,
      bk.arena,
      bk.date,
      bk.time,
      bk.amount,
      bk.status,
      bk.payment
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <Receipt className="text-[#1EE7FF]" /> Bookings History
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Detailed tracking of all court and coaching transactions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white hover:bg-[#22FF88] hover:text-[#0A1F44] hover:border-transparent'
                : 'bg-white border-black/10 text-black hover:bg-[#22FF88] hover:text-[#0A1F44] hover:border-transparent'
            }`}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: '₹42,850', color: '#22FF88' },
          { label: 'Active Bookings', value: '156', color: '#1EE7FF' },
          { label: 'Cancelled', value: '12', color: '#FF4B4B' },
          { label: 'New Revenue', value: '₹5,200', color: '#FFD600' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-2xl font-black font-display tracking-wide ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</h3>
              <ArrowUpRight size={18} style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#1EE7FF] transition-colors" />
          <input
            type="text"
            placeholder="Search by Booking ID, Customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-3.5 pl-12 pr-4 rounded-2xl text-sm font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#1EE7FF]/50 text-white shadow-inner' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#1EE7FF] text-[#0A1F44] shadow-sm'
            }`}
          />
        </div>

        <button 
          onClick={() => setShowFilterDrawer(true)}
          className={`px-6 py-3.5 rounded-2xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
          isDark 
            ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white hover:border-[#1EE7FF]/50' 
            : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44] hover:border-[#1EE7FF]'
        } ${statusFilter !== 'All' ? 'border-[#1EE7FF] text-[#1EE7FF]' : ''}`}>
          <Filter size={16} /> Filters {statusFilter !== 'All' && `(${statusFilter})`}
        </button>
      </div>

      {/* Table Container */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5 bg-white/5 text-white/40' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2 text-[#0A1F44]/40'}`}>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest pl-8">ID & Customer</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Court / Arena</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Schedule</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Amount</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.map((booking, idx) => (
                <motion.tr
                  key={booking.id}
                  whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(10,31,68,0.02)' }}
                  className="group transition-colors"
                >
                  <td className="p-4 pl-8">
                    <p className={`font-black tracking-wide text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{booking.customer}</p>
                    <p className="text-[10px] font-bold text-[#22FF88] uppercase tracking-[0.1em] mt-0.5">{booking.id}</p>
                  </td>
                  <td className="p-4 text-center">
                    <p className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-[#0A1F44]/80'}`}>{booking.court}</p>
                    <p className="text-[10px] font-medium text-white/30 truncate max-w-[120px] mx-auto">{booking.arena}</p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className={`p-1 pl-2 pr-3 rounded bg-[#0A1F44]/50 border border-white/5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                        <Clock size={10} className="text-[#FFD600]" />
                        <span className="text-[10px] font-black">{booking.time}</span>
                      </div>
                      <p className="text-[9px] font-bold text-white/20 mt-1 uppercase mt-1.5">{booking.date}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <p className={`font-display font-black text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{booking.amount}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${booking.payment === 'Paid' ? 'text-[#22FF88]' : 'text-[#FF4B4B]'}`}>{booking.payment}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${
                      booking.status === 'Completed' ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' :
                      booking.status === 'Upcoming' ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border-[#1EE7FF]/20' :
                      'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20'
                    }`}>
                      {booking.status === 'Completed' ? <CheckCircle size={10} /> : booking.status === 'Upcoming' ? <Clock size={10} /> : <XCircle size={10} />}
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 pr-8 text-right">
                    <div className="flex justify-end relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                        className={`p-2.5 rounded-xl transition-all border ${
                          activeMenu === booking.id
                            ? 'bg-[#1EE7FF] border-[#1EE7FF] text-[#0A1F44]'
                            : isDark 
                              ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/10' 
                              : 'bg-white border border-black/5 text-black/40 hover:text-black hover:border-black/20'
                        }`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === booking.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95, x: 20 }}
                              className={`absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl border z-20 shadow-2xl backdrop-blur-xl ${
                                isDark ? 'bg-[#0A1F44]/90 border-white/10 shadow-black' : 'bg-white/90 border-[#0A1F44]/10 shadow-blue-900/10'
                              }`}
                            >
                              <div className="space-y-1 text-left">
                                {[
                                  { label: 'View Receipt', icon: Eye, color: '#1EE7FF' },
                                  { label: 'Reschedule', icon: CalendarRange, color: '#22FF88' },
                                  { label: 'Process Refund', icon: RefreshCw, color: '#FFD600' },
                                  { label: 'Contact Customer', icon: Smartphone, color: '#A855F7' },
                                  { label: 'Cancel Booking', icon: Trash2, color: '#FF4B4B' },
                                ].map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setActiveMenu(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                      isDark ? 'hover:bg-white/5 text-white/60 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F44]'
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-lg border transition-colors`} style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}20`, color: opt.color }}>
                                      <opt.icon size={12} />
                                    </div>
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
