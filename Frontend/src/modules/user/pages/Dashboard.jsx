import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, GraduationCap, Download, Calendar, ShieldCheck, X, MapPin, Clock, Printer, CheckCircle2, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listMyBookings, cancelMyBooking } from '../../../services/bookingsApi';
import { listMyEnrollments, cancelMyEnrollment, listMyEventRegistrations, cancelMyEventRegistration } from '../../../services/meApi';
import { mapMeBookingToDashboardCard } from '../../../utils/meBookingAdapter';
import { mapEnrollmentToDashboardCard } from '../../../utils/enrollmentAdapter';
import { mapEventRegistrationToDashboardCard } from '../../../utils/eventRegistrationAdapter';
import { pruneUserBookingsLocalCache } from '../../../utils/userBookingsCache';
import BookingTimelineCard from '../components/BookingTimeline';
import BookingCard from '../components/BookingCard';
import NotificationToast, { useConflictToasts } from '../components/NotificationToast';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

// Full Receipt Modal
const ReceiptModal = ({ receipt, onClose }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
    <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="bg-[#36454F] px-6 py-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#CE2029] flex items-center justify-center"><Receipt size={16} strokeWidth={2.5} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{receipt.type === 'Coaching' ? 'Academy Fee Receipt' : 'Court Booking Receipt'}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X size={16} /></button>
        </div>
        <h3 className="text-xl font-black tracking-tight">{receipt.arenaName}</h3>
        <p className="text-[10px] text-white/50 font-bold mt-1 uppercase tracking-widest">Transaction #{receipt.id}</p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-3">
        {[
          { label: 'Booking ID', value: `#${receipt.id}`, icon: CheckCircle2 },
          { label: 'Date', value: receipt.date, icon: Calendar },
          { label: 'Time Slot', value: receipt.slot, icon: Clock },
          receipt.courtName && { label: 'Court', value: receipt.courtName, icon: MapPin },
          receipt.coachName && { label: 'Coach', value: receipt.coachName, icon: GraduationCap },
          receipt.plan && { label: 'Plan', value: receipt.plan, icon: Receipt },
        ].filter(Boolean).map((row, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
            <div className="flex items-center gap-2 text-slate-500">
              <row.icon size={13} className="text-[#CE2029]" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">{row.label}</span>
            </div>
            <span className="text-[12px] font-black text-[#36454F]">{row.value}</span>
          </div>
        ))}

        {/* Total */}
        <div className="mt-2 p-4 rounded-2xl bg-[#CE2029]/5 border border-[#CE2029]/10 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Paid</p>
            <p className="text-2xl font-black text-[#36454F] mt-0.5">OMR {Number(receipt.price).toFixed(3)}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Paid</span>
          </div>
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="w-full py-3.5 rounded-2xl bg-[#36454F] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#CE2029] transition-all active:scale-95"
        >
          <Printer size={16} strokeWidth={2.5} /> Print Receipt
        </button>
      </div>
    </motion.div>
  </div>
);

const ReceiptItem = ({ receipt }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <AnimatePresence>{showModal && <ReceiptModal receipt={receipt} onClose={() => setShowModal(false)} />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform pointer-events-none">
           <Receipt size={80} strokeWidth={1} />
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${receipt.type === 'Coaching' ? 'bg-[#CE2029]/5 text-[#CE2029]' : 'bg-indigo-50 text-indigo-600'}`}>
               <Receipt size={22} strokeWidth={2.5} />
            </div>
            <div>
               <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${receipt.type === 'Coaching' ? 'text-[#CE2029]' : 'text-indigo-500'}`}>
                  {receipt.type === 'Coaching' ? 'Academy Fee Receipt' : 'Court Booking Receipt'}
               </p>
               <h4 className="text-[15px] font-black text-[#36454F]">{receipt.arenaName}</h4>
            </div>
          </div>
          <div className="text-right max-w-[120px]">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Receipt ID</p>
             <div className="text-[10px] font-black text-[#36454F] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 truncate" title={`#${receipt.id}`}>
               #{receipt.id}
             </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-50 pt-5">
           <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-300" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{receipt.date}</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Paid</span>
           </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Amount</p>
              <p className="text-lg font-black text-[#36454F]">OMR {Number(receipt.price).toFixed(3)}</p>
           </div>
           <button
             onClick={() => setShowModal(true)}
             className="w-10 h-10 rounded-2xl bg-[#36454F] text-white flex items-center justify-center hover:bg-[#CE2029] hover:-translate-y-1 transition-all shadow-lg shadow-[#36454F]/20"
           >
              <Download size={18} strokeWidth={2.5} />
           </button>
        </div>
      </motion.div>
    </>
  );
};


const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toggleTheme } = useTheme();
  const isDark = false;
  const resolvedConflictBookings = useMemo(() => [], []);
  const { toasts, dismiss } = useConflictToasts(resolvedConflictBookings);
  const [allBookings, setAllBookings] = useState([]);

  const refetchBookings = useCallback(async () => {
    const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    if (!isApiConfigured() || !getAuthToken()) {
      setAllBookings(savedBookings);
      return;
    }
    try {
      const [data, enData, evData] = await Promise.all([
        listMyBookings().catch(err => { console.error('Bookings API Fail:', err); return { bookings: [] }; }),
        listMyEnrollments().catch(err => { console.error('Enrollments API Fail:', err); return { enrollments: [] }; }),
        listMyEventRegistrations().catch(err => { console.error('Events API Fail:', err); return { registrations: [] }; }),
      ]);
      console.log('RAW API DATA - Bookings:', data);
      console.log('RAW API DATA - Enrollments:', enData);
      console.log('RAW API DATA - Events:', evData);
      const courtCards = (data.bookings || []).map((b) => mapMeBookingToDashboardCard(b));
      const enrollCards = (enData.enrollments || []).map((e) => mapEnrollmentToDashboardCard(e));
      const eventCards = (evData.registrations || []).map((r) => mapEventRegistrationToDashboardCard(r));
      pruneUserBookingsLocalCache({
        bookingIds: courtCards.map((c) => c.id),
        enrollmentIds: enrollCards.map((c) => c.id),
        eventRegistrationIds: eventCards.map((c) => c.id),
      });
      const merged = [...courtCards, ...enrollCards, ...eventCards].sort((a, b) => {
        const da = new Date(a.sortKey || `${a.date}T12:00:00`);
        const db = new Date(b.sortKey || `${b.date}T12:00:00`);
        const ta = da.getTime();
        const tb = db.getTime();
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return tb - ta;
      });

      // Deduplicate by ID and content (Date + Slot)
      const unique = [];
      const seenIds = new Set();
      const seenContent = new Set();
      for (const b of merged) {
        const contentKey = `${b.date}_${b.slot}_${b.arenaName}`;
        if (!seenIds.has(b.id) && !seenContent.has(contentKey)) {
          seenIds.add(b.id);
          seenContent.add(contentKey);
          unique.push(b);
        }
      }

      console.log('DEBUG: Merged Dashboard Cards:', unique);
      setAllBookings(unique);
      
      // If we got valid data from server, we can safely clear old mock bookings 
      // that are not on the server to prevent "ghost" bookings.
      localStorage.setItem('userBookings', JSON.stringify([]));
    } catch (err) {
      console.error('DEBUG: Dashboard Fetch Error:', err);
      // When API is active, we should NOT fallback to old local mock data 
      // as it might contain bookings that were deleted/cancelled on server.
      setAllBookings([]);
    }
  }, []);

  useEffect(() => {
    refetchBookings();
  }, [refetchBookings]);

  const handleServerCancelBooking = useCallback(
    async (bookingId) => {
      await cancelMyBooking(bookingId);
      await refetchBookings();
    },
    [refetchBookings]
  );

  const handleServerCancelEnrollment = useCallback(
    async (enrollmentId) => {
      await cancelMyEnrollment(enrollmentId);
      await refetchBookings();
    },
    [refetchBookings]
  );

  const handleServerCancelEventRegistration = useCallback(
    async (registrationId) => {
      await cancelMyEventRegistration(registrationId);
      await refetchBookings();
    },
    [refetchBookings]
  );

  const apiLive = isApiConfigured() && Boolean(getAuthToken());

  const tabs = [
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'past', name: 'Past' },
    { id: 'coaching', name: 'Coaching' },
    { id: 'payments', name: 'Receipts' },
    { id: 'conflicts', name: 'Conflicts', badge: resolvedConflictBookings.length },
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      <NotificationToast toasts={toasts} onDismiss={dismiss} />
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Premium Dark Style */}
      {/* Header - Desktop Hidden Logo/Nav Row */}
      <div className="md:hidden">
        <div className={`px-4 pt-4 pb-4 bg-[#CE2029] rounded-b-3xl shadow-[0_10px_30px_rgba(206, 32, 41,0.15)] border-b border-white/10`}>
          <div className="max-w-5xl mx-auto flex justify-between items-center mb-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg font-bold font-display text-white tracking-tight">My Bookings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row - Visible on both but styled for desktop consistency */}
      <div className="px-6 pt-4 pb-2 md:pt-6 md:pb-1 z-[50] transition-all overflow-x-auto no-scrollbar">
        <div className={`min-w-fit max-w-5xl mx-auto flex gap-1.5 p-1.5 rounded-[22px] backdrop-blur-md relative overflow-hidden border transition-all ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-blue-100 shadow-sm'
        }`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none min-w-[80px] py-2.5 px-3 rounded-[16px] text-[10px] font-black uppercase tracking-wider transition-all duration-500 relative z-10 ${activeTab === tab.id
                  ? 'bg-gradient-to-br from-[#CE2029] to-[#CE2029] text-white shadow-[0_5px_15px_rgba(206, 32, 41, 0.3)]'
                  : 'text-[#36454F] hover:text-[#CE2029] hover:bg-slate-50'
                }`}
            >
              <span className="relative">
                {tab.name}
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[6px] font-black flex items-center justify-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 md:pt-1 md:pb-8 space-y-4 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {allBookings.filter(b => b.status === 'Upcoming' && b.type !== 'Coaching').length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allBookings.filter(b => b.status === 'Upcoming' && b.type !== 'Coaching').map((booking, index) => (
                    <BookingTimelineCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      onServerCancelBooking={apiLive ? handleServerCancelBooking : undefined}
                      onServerCancelEventRegistration={apiLive ? handleServerCancelEventRegistration : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-10">
                  <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-6">
                    <Receipt size={32} className="text-[#CE2029]/20" />
                  </div>
              <h3 className={`text-xl font-black font-display ${'text-[#36454F]'}`}>No upcoming slots</h3>
              <p className={`text-sm mt-2 font-bold opacity-30 ${'text-[#36454F]'}`}>Explore arenas and book your favorite court today!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'past' && (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {allBookings.filter((b) => b.status === 'Completed' && b.type !== 'Coaching').length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allBookings
                    .filter((b) => b.status === 'Completed' && b.type !== 'Coaching')
                    .map((booking, index) => (
                      <BookingTimelineCard
                        key={booking.id}
                        booking={booking}
                        index={index}
                        onServerCancelBooking={apiLive ? handleServerCancelBooking : undefined}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-20 px-10 max-w-5xl mx-auto">
                  <h3 className="text-xl font-black font-display text-[#36454F]">No past bookings</h3>
                  <p className="text-sm mt-2 font-bold opacity-30 text-[#36454F]">Completed court bookings will show here.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'coaching' && (
            <motion.div
              key="coaching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {allBookings.filter(b => b.type === 'Coaching').length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allBookings.filter(b => b.type === 'Coaching').map((booking, index) => (
                    <BookingTimelineCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      onServerCancelBooking={apiLive ? handleServerCancelBooking : undefined}
                      onServerCancelEnrollment={apiLive ? handleServerCancelEnrollment : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="max-w-5xl mx-auto text-center py-24 px-10">
                  <div className={`w-24 h-24 mx-auto rounded-[40px] flex items-center justify-center mb-8 border-[3px] shadow-2xl relative ${'bg-white border-blue-100 shadow-blue-500/5'
                    }`}>
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <GraduationCap size={40} className={`opacity-20 ${'text-blue-500'}`} />
                  </div>
                  <h3 className={`text-xl font-black font-display tracking-tight ${'text-[#0F172A]'}`}>No Academy History</h3>
                  <p className={`text-xs mt-3 font-bold leading-relaxed opacity-30 ${'text-[#0F172A]'}`}>
                    You haven't enrolled in any coaching classes yet. Start your training today!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'conflicts' && (
            <motion.div
              key="conflicts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Banner */}
              <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border border-orange-200 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon size={18} className="text-orange-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-black text-orange-700">Event Conflict Notice</p>
                  <p className="text-[10px] font-bold text-orange-500 mt-0.5 leading-relaxed">
                    {resolvedConflictBookings.length} of your booking{resolvedConflictBookings.length !== 1 ? 's are' : ' is'} affected by upcoming events.
                    Your plans have been extended automatically — no action needed.
                  </p>
                </div>
              </div>

              {resolvedConflictBookings.length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resolvedConflictBookings.map((booking, index) => (
                    <BookingCard key={booking.id} booking={booking} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-[32px] bg-emerald-50 border border-emerald-100 mx-auto flex items-center justify-center mb-6">
                    <Calendar size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-[#36454F]">No Conflicts</h3>
                  <p className="text-xs font-bold text-slate-400 mt-2">All your bookings are clear of event conflicts.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {allBookings.filter(b => b.receiptUrl).length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBookings.filter(b => b.receiptUrl).map((receipt) => (
                    <ReceiptItem key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              ) : (
                <div className="max-w-5xl mx-auto text-center py-24 px-10">
                  <div className={`w-24 h-24 mx-auto rounded-[40px] flex items-center justify-center mb-8 border-[3px] shadow-2xl relative bg-white border-blue-100 shadow-[0_10px_30px_rgba(206, 32, 41, 0.05)]`}>
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <Receipt size={40} className={`opacity-20 text-[#CE2029]`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black font-display tracking-tight ${'text-[#0F172A]'}`}>No receipts found</h3>
                    <p className={`text-xs mt-3 font-bold leading-relaxed opacity-30 ${'text-[#0F172A]'}`}>
                      Your booking and academy receipts will appear here once processed.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;



