import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Search, Download, Filter, MoreHorizontal, Clock, ArrowUpRight,
  Eye, CalendarRange, RefreshCw, Trash2
} from 'lucide-react';

const mockBookings = [
  { id: 'BK-1001', customer: 'Amit Sharma', court: 'Court 1', arena: 'Olympic Smash', date: '2026-03-12', time: '07:00 AM', amount: 800, status: 'Completed', payment: 'Paid', statusBg: '#76A87A', statusText: '#ffffff' },
  { id: 'BK-1002', customer: 'Rajesh Kumar', court: 'Court 3', arena: 'Olympic Smash', date: '2026-03-12', time: '09:00 AM', amount: 800, status: 'Upcoming', payment: 'Pending', statusBg: '#E88E3E', statusText: '#ffffff' },
  { id: 'BK-1003', customer: 'Sanya Mirza', court: 'Court 2', arena: 'Badminton Hub', date: '2026-03-12', time: '04:00 PM', amount: 1200, status: 'Upcoming', payment: 'Paid', statusBg: '#E88E3E', statusText: '#ffffff' },
  { id: 'BK-1004', customer: 'Vikram Singh', court: 'Court 1', arena: 'Olympic Smash', date: '2026-03-12', time: '05:00 PM', amount: 800, status: 'Cancelled', payment: 'Refunded', statusBg: '#ff6b6b', statusText: '#ffffff' },
  { id: 'BK-1005', customer: 'Neha Malik', court: 'Court 4', arena: 'Badminton Hub', date: '2026-03-13', time: '06:00 AM', amount: 950, status: 'Upcoming', payment: 'Paid', statusBg: '#E88E3E', statusText: '#ffffff' },
];

const Bookings = () => {
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
    // Basic CSV export logic remaining identical
    const headers = ['Booking ID', 'Customer', 'Court', 'Arena', 'Date', 'Time', 'Amount (₹)', 'Status', 'Payment'];
    const rows = mockBookings.map(bk => [
      bk.id, bk.customer, bk.court, bk.arena, bk.date, bk.time, bk.amount, bk.status, bk.payment
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
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-5 lg:space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1a2b3c] flex items-center gap-2">
              <Receipt className="text-[#eb483f]" size={24} /> Bookings Ledger
            </h2>
            <p className="text-xs md:text-sm mt-1 font-medium text-slate-500">Manage all facility reservations and transactions.</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#eb483f] hover:border-[#eb483f] transition-all shadow-sm font-bold text-xs uppercase tracking-wider"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: '₹42,500', color: '#eb483f' },
            { label: 'Total Bookings', value: '156', color: '#eb483f' },
            { label: 'Cancellations', value: '12', color: '#ff6b6b' },
            { label: 'Est. Yield', value: '₹5,000', color: '#eb483f' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between transition-all hover:border-[#eb483f]/40">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-[#1a2b3c] tracking-tight">{stat.value}</h3>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <ArrowUpRight size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
            <input
              type="text"
              placeholder="Search by customer or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-[#1a2b3c] placeholder:text-slate-400 focus:outline-none focus:border-[#eb483f] transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => setShowFilterDrawer(true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
              statusFilter !== 'All' 
                ? 'bg-[#eb483f]/10 border-[#eb483f] text-[#eb483f]' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-[#eb483f]'
            }`}
          >
            <Filter size={14} /> {statusFilter !== 'All' ? statusFilter : 'Filters'}
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#eb483f]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
              <thead className="bg-[#F8F9FA] text-[#1a2b3c] font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4 text-center">Facility</th>
                  <th className="px-6 py-4 text-center">Schedule</th>
                  <th className="px-6 py-4 text-center">Financials</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.map((booking, idx) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Client Detail */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1a2b3c]">{booking.customer}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{booking.id}</p>
                    </td>

                    {/* Facility */}
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-slate-700">{booking.court}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{booking.arena}</p>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock size={12} className="text-[#eb483f]" />
                        <span className="text-xs font-bold">{booking.time}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">{booking.date}</p>
                    </td>

                    {/* Financials */}
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-[#1a2b3c] text-sm">₹{booking.amount}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${booking.payment === 'Paid' ? 'text-[#76A87A]' : booking.payment === 'Pending' ? 'text-[#E88E3E]' : 'text-[#ff6b6b]'}`}>
                        {booking.payment}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span 
                        className="inline-flex items-center justify-center px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md" 
                        style={{ backgroundColor: booking.statusBg, color: booking.statusText }}
                      >
                        {booking.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                          className={`p-2 rounded-lg border transition-all ${
                            activeMenu === booking.id
                              ? 'bg-slate-100 border-slate-300 text-[#eb483f]'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-[#eb483f] hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        <AnimatePresence>
                          {activeMenu === booking.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-xl z-20"
                              >
                                <div className="space-y-1">
                                  {[
                                    { label: 'View Details', icon: Eye, color: '#eb483f' },
                                    { label: 'Reschedule', icon: CalendarRange, color: '#eb483f' },
                                    { label: 'Process Refund', icon: RefreshCw, color: '#E88E3E' },
                                    { label: 'Cancel Booking', icon: Trash2, color: '#FF4B4B' },
                                  ].map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setActiveMenu(null)}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1a2b3c] transition-colors group"
                                    >
                                      <div className="p-1.5 rounded-md border" style={{ backgroundColor: `${opt.color}15`, borderColor: `${opt.color}30`, color: opt.color }}>
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
    </div>
  );
};

export default Bookings;


