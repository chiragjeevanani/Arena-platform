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
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Receipt className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Ledger
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Registry flows.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white hover:bg-[#eb483f] hover:text-[#0A1F44]'
                : 'bg-white border-black/10 text-black hover:bg-[#eb483f] hover:text-[#0A1F44] shadow-sm'
            }`}
          >
            <Download size={12} /> Sync
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Network', value: '₹42K', color: '#eb483f' },
          { label: 'Flow', value: '156', color: '#eb483f' },
          { label: 'Void', value: '12', color: '#FF4B4B' },
          { label: 'Yield', value: '₹5K', color: '#eb483f' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-2.5 md:p-6 rounded-xl md:rounded-[2rem] border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
            <p className={`text-[6px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>{stat.label}</p>
            <div className="flex items-center justify-between">
              <h3 className={`text-base md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</h3>
              <ArrowUpRight size={10} className="md:w-[18px] md:h-[18px]" style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1 relative group">
          <Search size={14} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 group-focus-within:text-[#eb483f]' : 'text-[#0A1F44]/30'}`} />
          <input
            type="text"
            placeholder="Query ledger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2.5 md:py-3.5 pl-9 md:pl-12 pr-4 rounded-lg md:rounded-2xl text-[10px] md:text-sm font-bold transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/10 text-white placeholder:text-white/20' 
                : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] shadow-sm'
            }`}
          />
        </div>

        <button 
          onClick={() => setShowFilterDrawer(true)}
          className={`w-full sm:w-auto px-6 py-2.5 md:py-3.5 rounded-lg md:rounded-2xl border flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
          isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/40 hover:text-[#0A1F44]'
        } ${statusFilter !== 'All' ? 'border-[#eb483f] text-[#eb483f]' : ''}`}>
          <Filter size={12} /> Status
        </button>
      </div>

      {/* Table Container */}
      <div className={`rounded-xl md:rounded-[2rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
               <tr className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/40 border-white/5 bg-white/5' : 'text-[#eb483f] border-[#eb483f]/10 bg-[#eb483f]/2'}`}>
                <th className="p-3 md:p-6">Client</th>
                <th className="p-3 md:p-6 text-center">Unit</th>
                <th className="p-3 md:p-6 text-center">Schedule</th>
                <th className="p-3 md:p-6 text-center">Flow</th>
                <th className="p-3 md:p-6 text-center">State</th>
                <th className="p-3 md:p-6 text-right pr-6 md:pr-10">Ops</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
              {filteredBookings.map((booking, idx) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3 md:p-6">
                    <p className={`font-black tracking-tight text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{booking.customer.split(' ')[0]}</p>
                    <p className="text-[6px] md:text-[9px] font-bold text-[#eb483f] uppercase tracking-widest leading-tight opacity-40">{booking.id}</p>
                  </td>
                   <td className="p-3 md:p-6 text-center">
                    <p className={`text-[9px] md:text-xs font-bold ${isDark ? 'text-white/80' : 'text-[#0A1F44]/80'}`}>{booking.court}</p>
                    <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-[#eb483f] opacity-60">{booking.arena.split(' ')[0]}</p>
                  </td>
                   <td className="p-3 md:p-6 text-center">
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0A1F44]/30 border border-white/5 ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>
                        <Clock size={8} className="text-[#eb483f]" />
                        <span className="text-[8px] md:text-[10px] font-black">{booking.time}</span>
                      </div>
                      <p className="text-[6px] md:text-[8px] font-black text-white/20 mt-0.5 uppercase tracking-widest">{booking.date}</p>
                  </td>
                   <td className="p-3 md:p-6 text-center">
                    <p className={`font-display font-black text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{booking.amount}</p>
                    <p className={`text-[6px] md:text-[8px] font-black uppercase tracking-widest ${booking.payment === 'Paid' ? 'text-[#eb483f]/60' : 'text-[#FF4B4B]/60'}`}>{booking.payment}</p>
                  </td>
                   <td className="p-3 md:p-6 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest border ${
                      booking.status === 'Completed' ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' :
                      booking.status === 'Upcoming' ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' :
                      'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20'
                    }`}>
                      {booking.status === 'Completed' ? 'Done' : booking.status === 'Upcoming' ? 'Wait' : 'Void'}
                    </span>
                  </td>
                   <td className="p-3 md:p-6 text-right pr-6 md:pr-10">
                    <div className="flex justify-end relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                        className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all border ${
                          activeMenu === booking.id
                            ? 'bg-[#eb483f] border-[#eb483f] text-[#0A1F44]'
                            : isDark 
                              ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' 
                              : 'bg-white border border-black/10 text-black/40 hover:text-black'
                        }`}
                      >
                        <MoreHorizontal size={12} className="md:w-[16px] md:h-[16px]" />
                      </button>

                      <AnimatePresence>
                        {activeMenu === booking.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95, x: 20 }}
                              className={`absolute right-0 top-full mt-1.5 w-48 p-1.5 rounded-xl border z-20 shadow-2xl backdrop-blur-xl ${
                                isDark ? 'bg-[#0A1F44]/90 border-white/10' : 'bg-white/90 border-[#0A1F44]/10'
                              }`}
                            >
                               <div className="space-y-0.5 text-left">
                                {[
                                  { label: 'View', icon: Eye, color: '#eb483f' },
                                  { label: 'Reschedule', icon: CalendarRange, color: '#eb483f' },
                                  { label: 'Refund', icon: RefreshCw, color: '#eb483f' },
                                  { label: 'Cancel', icon: Trash2, color: '#FF4B4B' },
                                ].map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setActiveMenu(null)}
                                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                      isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F0A]'
                                    }`}
                                  >
                                    <div className={`p-1 rounded-md border transition-colors`} style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}20`, color: opt.color }}>
                                      <opt.icon size={10} />
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


