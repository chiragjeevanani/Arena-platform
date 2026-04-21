import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Search, Download, Filter, MoreHorizontal, Clock, ArrowUpRight,
  Eye, CalendarRange, RefreshCw, Trash2, X, CheckCircle, AlertTriangle, Calendar, MapPin,
  Banknote, Wallet, CreditCard, User, Target
} from 'lucide-react';

const mockBookings = [
  { id: 'BK-1001', customer: 'Amit Sharma', court: 'Court 1', arena: 'Amm Sports Arena', date: '2026-03-12', time: '07:00 AM', amount: 4.500, status: 'Completed', payment: 'Paid', paymentMethod: 'Online', statusBg: '#76A87A', statusText: '#ffffff' },
  { id: 'BK-1002', customer: 'Rajesh Kumar', court: 'Court 3', arena: 'Amm Sports Arena', date: '2026-03-12', time: '09:00 AM', amount: 3.500, status: 'Upcoming', payment: 'Pending', paymentMethod: 'Online', statusBg: '#E88E3E', statusText: '#ffffff' },
  { id: 'BK-1003', customer: 'Sanya Mirza', court: 'Court 2', arena: 'Amm Sports Arena', date: '2026-03-12', time: '04:00 PM', amount: 5.000, status: 'Upcoming', payment: 'Paid', paymentMethod: 'Online', statusBg: '#E88E3E', statusText: '#ffffff' },
  { id: 'BK-1004', customer: 'Vikram Singh', court: 'Court 1', arena: 'Amm Sports Arena', date: '2026-03-12', time: '05:00 PM', amount: 4.000, status: 'Cancelled', payment: 'Refunded', paymentMethod: 'Online', statusBg: '#ff6b6b', statusText: '#ffffff' },
  { id: 'BK-1005', customer: 'Neha Malik', court: 'Court 4', arena: 'Amm Sports Arena', date: '2026-03-13', time: '06:00 AM', amount: 4.500, status: 'Upcoming', payment: 'Paid', paymentMethod: 'Cash', statusBg: '#E88E3E', statusText: '#ffffff' },
];

// ── View Details Modal ──────────────────────────────────────────
const ViewDetailsModal = ({ booking, onClose }) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      <div className="bg-[#36454F] px-6 py-5 text-white flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Booking Details</p>
          <h3 className="text-lg font-black mt-0.5">{booking.id}</h3>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X size={16} /></button>
      </div>
      <div className="p-6 space-y-3">
        {[
          { icon: Eye, label: 'Customer', value: booking.customer },
          { icon: MapPin, label: 'Arena', value: booking.arena },
          { icon: MapPin, label: 'Court', value: booking.court },
          { icon: Calendar, label: 'Date', value: booking.date },
          { icon: Clock, label: 'Time', value: booking.time },
          { icon: Receipt, label: 'Amount', value: `OMR ${booking.amount.toFixed(3)}` },
          { icon: CheckCircle, label: 'Payment', value: booking.payment },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
              <row.icon size={13} className="text-[#CE2029]" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
            </div>
            <span className="text-[13px] font-black text-[#36454F]">{row.value}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between p-4 rounded-2xl bg-[#CE2029]/5 border border-[#CE2029]/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
          <span className="px-3 py-1 rounded-lg text-xs font-black text-white" style={{ backgroundColor: booking.statusBg }}>{booking.status}</span>
        </div>
      </div>
    </motion.div>
  </div>
);

// ── Reschedule Modal ────────────────────────────────────────────
const RescheduleModal = ({ booking, onClose, onConfirm }) => {
  const [newDate, setNewDate] = useState(booking.date);
  const [done, setDone] = useState(false);
  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => { onConfirm(booking.id, newDate); onClose(); }, 1200);
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center"><CalendarRange size={18} className="text-[#CE2029]" /></div>
            <div>
              <h3 className="text-base font-black text-[#36454F]">Reschedule Booking</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{booking.id} · {booking.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Current Date</label>
            <div className="py-3 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400">{booking.date} · {booking.time}</div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">New Date</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] focus:bg-white transition-all" />
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-[10px] font-bold text-amber-700">⚡ Customer will be notified automatically upon confirmation.</p>
          </div>
          <button onClick={handleConfirm} disabled={done || !newDate}
            className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60">
            {done ? <><CheckCircle size={14} /> Rescheduled!</> : <><CalendarRange size={14} /> Confirm Reschedule</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Refund Modal ────────────────────────────────────────────────
const RefundModal = ({ booking, onClose, onConfirm }) => {
  const [done, setDone] = useState(false);
  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => { onConfirm(booking.id); onClose(); }, 1200);
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4"><RefreshCw size={26} className="text-amber-500" /></div>
          <h3 className="text-lg font-black text-[#36454F] text-center">Process Refund?</h3>
          <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
            Refund <span className="font-black text-[#CE2029]">OMR {booking.amount.toFixed(3)}</span> to <span className="font-black text-[#36454F]">{booking.customer}</span>?<br />Amount will be credited within 5–7 business days.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleConfirm} disabled={done}
              className="flex-1 py-3 rounded-2xl bg-amber-500 text-white text-xs font-black uppercase hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {done ? <><CheckCircle size={14} /> Done</> : 'Process Refund'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Cancel Modal ────────────────────────────────────────────────
const CancelModal = ({ booking, onClose, onConfirm }) => {
  const [done, setDone] = useState(false);
  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => { onConfirm(booking.id); onClose(); }, 1200);
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><AlertTriangle size={26} className="text-red-500" /></div>
          <h3 className="text-lg font-black text-[#36454F] text-center">Cancel Booking?</h3>
          <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
            You're cancelling <span className="font-black text-[#36454F]">{booking.id}</span> for <span className="font-black text-[#36454F]">{booking.customer}</span>. This cannot be undone.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase hover:bg-slate-50 transition-all">Keep It</button>
            <button onClick={handleConfirm} disabled={done}
              className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {done ? <><CheckCircle size={14} /> Cancelled</> : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Cash Payment Modal ──────────────────────────────────────────
const CashPaymentModal = ({ onClose, onConfirm }) => {
  const [form, setForm] = useState({ customer: '', court: 'Court 1', date: new Date().toISOString().split('T')[0], time: '07:00 AM', amount: '' });
  const [done, setDone] = useState(false);
  const handleConfirm = () => {
    if (!form.customer.trim() || !form.amount) return;
    setDone(true);
    setTimeout(() => { onConfirm(form); onClose(); }, 1200);
  };
  const timeSlots = ['06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM'];
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#36454F] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Banknote size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-base font-black">Record Cash Payment</h3>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Offline Transaction Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X size={16} /></button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Customer Name</label>
            <div className="relative">
              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                placeholder="Enter customer name" className="w-full py-3 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none focus:border-[#CE2029] focus:bg-white transition-all" />
            </div>
          </div>

          {/* Court & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Court</label>
              <select value={form.court} onChange={e => setForm(p => ({ ...p, court: e.target.value }))}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] cursor-pointer transition-all">
                {['Court 1','Court 2','Court 3','Court 4','Court 5'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Time Slot</label>
              <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] cursor-pointer transition-all">
                {timeSlots.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Booking Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] focus:bg-white transition-all" />
          </div>

          {/* Amount */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Amount (OMR)</label>
            <div className="relative">
              <Wallet size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="number" step="0.001" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.000" className="w-full py-3 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] placeholder:text-slate-400 outline-none focus:border-[#CE2029] focus:bg-white transition-all" />
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3 rounded-2xl bg-green-50 border border-green-100 flex items-start gap-2">
            <Banknote size={14} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-green-700 leading-relaxed">This booking will be recorded as a <strong>Cash Payment</strong>. No online transaction will be processed.</p>
          </div>

          {/* Submit */}
          <button onClick={handleConfirm} disabled={done || !form.customer.trim() || !form.amount}
            className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-60 shadow-lg shadow-green-600/20">
            {done ? <><CheckCircle size={14} /> Payment Recorded!</> : <><Banknote size={14} /> Record Cash Payment</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────
const Bookings = () => {
  const [bookings, setBookings] = useState(mockBookings);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal state
  const [viewModal, setViewModal] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cashModal, setCashModal] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReschedule = (id, newDate) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, date: newDate } : b));
  };

  const handleRefund = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, payment: 'Refunded', status: 'Cancelled', statusBg: '#ff6b6b' } : b));
  };

  const handleCashPayment = (form) => {
    const newBooking = {
      id: `BK-${1000 + bookings.length + 1}`,
      customer: form.customer,
      court: form.court,
      arena: 'Amm Sports Arena',
      date: form.date,
      time: form.time,
      amount: parseFloat(form.amount) || 0,
      status: 'Completed',
      payment: 'Paid',
      paymentMethod: 'Cash',
      statusBg: '#76A87A',
      statusText: '#ffffff',
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleCancel = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled', statusBg: '#ff6b6b', payment: b.payment === 'Paid' ? 'Pending Refund' : b.payment } : b));
  };

  const exportToCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Court', 'Arena', 'Date', 'Time', 'Amount (OMR)', 'Status', 'Payment'];
    const rows = bookings.map(bk => [bk.id, bk.customer, bk.court, bk.arena, bk.date, bk.time, bk.amount.toFixed(3), bk.status, bk.payment]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `bookings_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const totalRevenue = bookings.filter(b => b.payment === 'Paid').reduce((a, b) => a + b.amount, 0);
  const totalCancellations = bookings.filter(b => b.status === 'Cancelled').length;

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">

      {/* Modals */}
      <AnimatePresence>
        {viewModal && <ViewDetailsModal booking={viewModal} onClose={() => setViewModal(null)} />}
        {rescheduleModal && <RescheduleModal booking={rescheduleModal} onClose={() => setRescheduleModal(null)} onConfirm={handleReschedule} />}
        {refundModal && <RefundModal booking={refundModal} onClose={() => setRefundModal(null)} onConfirm={handleRefund} />}
        {cancelModal && <CancelModal booking={cancelModal} onClose={() => setCancelModal(null)} onConfirm={handleCancel} />}
        {cashModal && <CashPaymentModal onClose={() => setCashModal(false)} onConfirm={handleCashPayment} />}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[119] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-[#36454F] text-lg">Filter Bookings</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"><X size={15} /></button>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
                <div className="space-y-2">
                  {['All', 'Upcoming', 'Completed', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setShowFilterDrawer(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border ${statusFilter === s ? 'bg-[#CE2029]/10 border-[#CE2029] text-[#CE2029]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto space-y-5 lg:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36454F] flex items-center gap-2">
              <Receipt className="text-[#CE2029]" size={24} /> Bookings Ledger
            </h2>
            <p className="text-xs md:text-sm mt-1 font-medium text-slate-500">Manage all facility reservations and transactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCashModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-md shadow-green-600/20 font-bold text-xs uppercase tracking-wider">
              <Banknote size={14} /> Record Cash Payment
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#CE2029] hover:border-[#CE2029] transition-all shadow-sm font-bold text-xs uppercase tracking-wider">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `OMR ${totalRevenue.toFixed(3)}`, color: '#CE2029' },
            { label: 'Total Bookings', value: `${bookings.length}`, color: '#CE2029' },
            { label: 'Cancellations', value: `${totalCancellations}`, color: '#ff6b6b' },
            { label: 'Upcoming', value: `${bookings.filter(b => b.status === 'Upcoming').length}`, color: '#E88E3E' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between transition-all hover:border-[#CE2029]/40">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-[#36454F] tracking-tight">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <ArrowUpRight size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
            <input type="text" placeholder="Search by customer or booking ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-[#36454F] placeholder:text-slate-400 focus:outline-none focus:border-[#CE2029] transition-all shadow-sm" />
          </div>
          <button onClick={() => setShowFilterDrawer(true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${statusFilter !== 'All' ? 'bg-[#CE2029]/10 border-[#CE2029] text-[#CE2029]' : 'bg-white border-slate-200 text-slate-600 hover:text-[#CE2029]'}`}>
            <Filter size={14} /> {statusFilter !== 'All' ? statusFilter : 'Filters'}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
              <thead className="bg-[#F8F9FA] text-[#36454F] font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4 text-center">Facility</th>
                  <th className="px-6 py-4 text-center">Schedule</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.map((booking, idx) => (
                  <motion.tr key={booking.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#36454F]">{booking.customer}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{booking.id}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-slate-700">{booking.court}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{booking.arena}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock size={12} className="text-[#CE2029]" />
                        <span className="text-xs font-bold">{booking.time}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">{booking.date}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-[#36454F] text-sm">OMR {booking.amount.toFixed(3)}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${booking.payment === 'Paid' ? 'text-[#76A87A]' : booking.payment === 'Pending' ? 'text-[#E88E3E]' : 'text-[#ff6b6b]'}`}>{booking.payment}</p>
                        {booking.paymentMethod && (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                            booking.paymentMethod === 'Cash' 
                              ? 'bg-green-50 text-green-600 border-green-200' 
                              : 'bg-blue-50 text-blue-500 border-blue-200'
                          }`}>
                            {booking.paymentMethod === 'Cash' ? <Banknote size={8} /> : <CreditCard size={8} />}
                            {booking.paymentMethod}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md" style={{ backgroundColor: booking.statusBg, color: booking.statusText }}>{booking.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block text-left">
                        <button onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                          className={`p-2 rounded-lg border transition-all ${activeMenu === booking.id ? 'bg-slate-100 border-slate-300 text-[#CE2029]' : 'bg-white border-slate-200 text-slate-400 hover:text-[#CE2029] hover:border-slate-300 shadow-sm'}`}>
                          <MoreHorizontal size={16} />
                        </button>
                        <AnimatePresence>
                          {activeMenu === booking.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-xl z-20">
                                <div className="space-y-1">
                                  {[
                                    { label: 'View Details', icon: Eye, color: '#CE2029', action: () => { setViewModal(booking); setActiveMenu(null); } },
                                    { label: 'Reschedule', icon: CalendarRange, color: '#CE2029', action: () => { setRescheduleModal(booking); setActiveMenu(null); }, disabled: booking.status === 'Cancelled' || booking.status === 'Completed' },
                                    { label: 'Process Refund', icon: RefreshCw, color: '#E88E3E', action: () => { setRefundModal(booking); setActiveMenu(null); }, disabled: booking.payment === 'Refunded' || booking.payment === 'Pending Refund' },
                                    { label: 'Cancel Booking', icon: Trash2, color: '#FF4B4B', action: () => { setCancelModal(booking); setActiveMenu(null); }, disabled: booking.status === 'Cancelled' },
                                  ].map((opt, i) => (
                                    <button key={i} onClick={opt.action} disabled={opt.disabled}
                                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#36454F] transition-colors ${opt.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
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
                {filteredBookings.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold text-sm">No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
