import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, MapPin, ChevronRight, Download, Map, XCircle, Trophy, Activity, UserCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listMyBookings } from '../../../services/bookingsApi';
import { listMyEventRegistrations, listMyEnrollments, getMyEnrollmentById } from '../../../services/meApi';
import { mapMeBookingToDashboardCard, mapMeEnrollmentToDashboardCard } from '../../../utils/meBookingAdapter';
import { mapEventRegistrationToDashboardCard } from '../../../utils/eventRegistrationAdapter';
import { storage } from '../../../utils/storage';

const BookingDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { id } = useParams();
  
  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isApiConfigured() || !getAuthToken()) {
          // Fallback to local storage for demo/offline
          const savedBookings = JSON.parse(storage.getItem('userBookings') || '[]');
          const local = savedBookings.find(b => String(b.id) === String(id));
          if (local) {
            setBooking(local);
          } else {
            setError('Booking not found.');
          }
          setLoading(false);
          return;
        }

        // 1. Try fetching specific enrollment first
        try {
          const res = await getMyEnrollmentById(id);
          if (res.enrollment) {
            setBooking(mapMeEnrollmentToDashboardCard(res.enrollment));
            setLoading(false);
            return;
          }
        } catch (e) {
          // Continue to other lists
        }

        // 2. Fetch all lists in parallel
        const [bData, evData, enData] = await Promise.all([
          listMyBookings().catch(() => ({ bookings: [] })),
          listMyEventRegistrations().catch(() => ({ registrations: [] })),
          listMyEnrollments().catch(() => ({ enrollments: [] }))
        ]);

        const bRaw = (bData.bookings || []).find((b) => String(b.id) === String(id));
        const enRaw = (enData.enrollments || []).find((e) => String(e.id) === String(id));
        const evRaw = (evData.registrations || []).find((ev) => String(ev.id) === String(id));

        if (bRaw) {
          setBooking(mapMeBookingToDashboardCard(bRaw));
        } else if (enRaw) {
          setBooking(mapMeEnrollmentToDashboardCard(enRaw));
        } else if (evRaw) {
          setBooking(mapEventRegistrationToDashboardCard(evRaw));
        } else {
          // 3. Last fallback: check storage
          const savedBookings = JSON.parse(storage.getItem('userBookings') || '[]');
          const found = savedBookings.find((b) => String(b.id) === String(id));
          if (found) {
            setBooking(found);
          } else {
            setError('Booking not found or you are not authorized to view it.');
          }
        }
      } catch (err) {
        console.error('Fetch Details Error:', err);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);
  
  useEffect(() => {
    if (booking?.arenaName) {
      document.title = `Booking at ${booking.arenaName} | AMM Sports`;
    }
  }, [booking]);

  if (loading) return (
    <div className={`p-20 text-center ${'text-slate-400'}`}>
      <div className="animate-spin w-8 h-8 border-4 border-[#CE2029] border-t-transparent rounded-full mx-auto mb-4" />
      Syncing details...
    </div>
  );

  if (error || !booking) return (
    <div className={`p-10 text-center ${'text-[#CE2029]/60'}`}>
      <div className="mb-4">{error || 'No booking details found.'}</div>
      <ShuttleButton onClick={() => navigate(-1)} variant="outline" size="sm">Go Back</ShuttleButton>
    </div>
  );

  const priceParsed = parseFloat(booking.price?.toString().replace(/[^\d.]/g, '') || '0');
  const taxPct = Number(booking.taxPercent || 18);
  const baseRate = booking.basePrice ? Number(booking.basePrice) : (priceParsed / (1 + (taxPct / 100)));
  const taxAmount = priceParsed - baseRate;

  return (
    <div className={`min-h-screen pb-20 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      {/* Background Decorative Elements */}
      {!isDark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#CE2029]/[0.03] rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-blue-500/[0.03] rounded-full blur-[80px]" />
        </div>
      )}

      {/* Header - Mobile */}
      <div className={`lg:hidden px-4 pt-4 pb-3 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-[#CE2029] border-blue-900/10 rounded-b-[20px] shadow-[0_4px_15px_rgba(10,31,68,0.1)]'}`}>
        <div className="flex items-center gap-3">
           <button
             onClick={() => navigate(-1)}
             className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
           >
             <ArrowLeft size={16} />
           </button>
           <h1 className="text-sm font-bold text-white font-display text-center flex-1 pr-8">Booking Details</h1>
        </div>
      </div>

      {/* Modern Compact Header (Desktop) */}
      <div className={`hidden lg:block sticky top-0 z-[100] backdrop-blur-2xl border-b transition-all duration-300 ${'bg-white/80 border-slate-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
           <button
             onClick={() => navigate(-1)}
             className="group flex items-center gap-2 text-slate-400 hover:text-[#CE2029] transition-all duration-300"
           >
             <div className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-100 bg-white shadow-sm group-hover:shadow group-hover:border-[#CE2029]/20 group-hover:translate-x-[-2px] transition-all">
               <ArrowLeft size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.15em]">Go Back</span>
           </button>
           
           <div className="flex flex-col items-center">
             <h1 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] font-display">Booking Detail</h1>
             <div className="h-0.5 w-6 bg-[#CE2029] rounded-full mt-0.5" />
           </div>

           <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Arena details & Status */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm"
            >
               <div className="aspect-[21/7] relative">
                  <img src={booking.arenaImage || "https://images.unsplash.com/photo-1544497422-944f21db2eec"} alt={booking.arenaName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        booking.status === 'Upcoming' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                         {booking.status}
                      </div>
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">#{booking.id || "BKG-1029"}</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white font-display leading-tight">{booking.arenaName}</h2>
                  </div>
               </div>

               <div className="p-4 lg:p-6 space-y-6">
                  <div className="flex items-center gap-2 text-slate-600">
                     <MapPin size={16} className="text-[#CE2029]" />
                     <span className="text-xs font-bold tracking-wide">{booking.location}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {(booking.inclusions && booking.inclusions.length > 0 ? booking.inclusions : ['Sanitized', 'Equipment', 'Parking']).map((t, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 gap-1.5">
                           <CheckCircle size={14} className="text-emerald-500" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{t}</span>
                        </div>
                     ))}
                     <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
                        <Map size={14} className="text-blue-500" />
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest text-center">Directions</span>
                     </div>
                  </div>

                  {booking.status === 'Upcoming' && (
                     <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                       <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                       <div>
                         <h4 className="text-xs font-black text-amber-900 mb-1">Please Arrive Early</h4>
                         <p className="text-[11px] font-semibold text-amber-700/80 leading-relaxed">
                            Kindly arrive 15 minutes before your slot time to ensure a smooth check-in process. Don't forget to carry your sports shoes.
                         </p>
                       </div>
                     </div>
                  )}
               </div>
            </motion.div>
          </div>

          {/* COACHING SPECIFIC DETAILS */}
          {booking.type === 'COACHING' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Timing & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#CE2029]/5 flex items-center justify-center text-[#CE2029] group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                       <Calendar size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Program Days</p>
                       <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{booking.days || 'Training Days'}</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                       <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Batch Timing</p>
                       <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{booking.timing || 'See Schedule'}</p>
                    </div>
                 </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <UserCheck size={18} />
                       </div>
                       <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Attendance Report</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recent Sessions</p>
                       </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                       <span className="text-lg font-black text-emerald-600">
                          {booking.attendance?.filter(a => a.status === 'present').length || 0}
                       </span>
                       <span className="text-[9px] font-black text-slate-300 uppercase">/ {booking.attendance?.length || 0}</span>
                    </div>
                 </div>
                 <div className="p-2 lg:p-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                       {booking.attendance?.length > 0 ? (
                         booking.attendance.slice(0, 15).map((session, idx) => (
                           <div key={idx} className="flex flex-col items-center gap-2 min-w-[50px]">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                                session.status === 'present' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                  : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                 {session.status === 'present' ? 'P' : 'A'}
                              </div>
                              <span className="text-[7px] font-black text-slate-400 uppercase">{new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                           </div>
                         ))
                       ) : (
                         <p className="text-[10px] font-bold text-slate-400 py-4 px-2 italic">No attendance records found yet.</p>
                       )}
                    </div>
                 </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Trophy size={18} />
                       </div>
                       <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Skill Matrix</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Coach Insights</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-6 space-y-4">
                    {booking.metrics?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                         {booking.metrics.map((m, idx) => (
                            <div key={idx} className="space-y-1.5">
                               <div className="flex justify-between items-center px-1">
                                  <span className="text-[9px] font-black uppercase tracking-tight text-slate-500">{m.name}</span>
                                  <span className="text-[10px] font-black text-[#CE2029]">{m.score.toFixed(1)}</span>
                               </div>
                               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${(m.score / 10) * 100}%` }}
                                     transition={{ duration: 1, delay: 0.2 + (idx * 0.05) }}
                                     className="h-full bg-gradient-to-r from-[#CE2029] to-[#ff4d4d]"
                                  />
                               </div>
                            </div>
                         ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-3">
                         <Activity size={32} className="mx-auto text-slate-200" />
                         <p className="text-[10px] font-bold text-slate-400 italic">Matrix will be updated after your first assessment.</p>
                      </div>
                    )}

                    {booking.remarks && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group transition-all">
                         <Star size={16} className="absolute -top-2 -left-2 text-amber-400 drop-shadow-sm group-hover:scale-110 transition-transform" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-1.5">Coach's Feed</p>
                         <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{booking.remarks}"</p>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}

          {/* RIGHT COLUMN: Receipt Block */}
          <div className="lg:col-span-5 relative">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:sticky lg:top-24"
            >
               <div className="bg-slate-900 p-5 lg:p-6 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black font-display tracking-wide mb-0.5">Booking Info</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Ticket</p>
                  </div>
               </div>
               
               <div className="p-5 lg:p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date</p>
                        <div className="flex items-center gap-1.5 text-slate-900">
                           <Calendar size={12} className="text-[#CE2029]" />
                           <span className="text-xs font-black">{booking.date}</span>
                        </div>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Court</p>
                        <div className="flex items-center gap-1.5 justify-end text-slate-900">
                           <span className="text-xs font-black">{booking.courtName}</span>
                           <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029]" />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Time</p>
                        <div className="flex items-center gap-1.5 text-slate-900">
                           <Clock size={12} className="text-blue-500" />
                           <span className="text-xs font-black">{booking.slot}</span>
                        </div>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Type</p>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">{booking.type || 'Standard'}</span>
                     </div>
                  </div>

                  <div className="relative h-px flex items-center">
                     <div className="absolute left-0 -translate-x-8 w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-100 shadow-inner" />
                     <div className="w-full border-t-2 border-dashed border-slate-100" />
                     <div className="absolute right-0 translate-x-8 w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-100 shadow-inner" />
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Base Rate</span>
                        <span className="text-slate-900 font-black">OMR {baseRate.toFixed(3)}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Tax Amount</span >
                        <span className="text-slate-900 font-black">OMR {taxAmount.toFixed(3)}</span>
                     </div>
                     
                     <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-end">
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#CE2029]">Total Paid</p>
                        <span className="text-2xl font-black font-display text-slate-900">OMR {priceParsed.toFixed(3)}</span>
                     </div>
                  </div>

                  <div className="pt-3 space-y-2.5 flex flex-col items-center">
                     <ShuttleButton
                        variant="outline"
                        fullWidth
                        className="py-3 text-[10px]"
                        icon={<Download size={14} />}
                     >
                        Download Invoice
                     </ShuttleButton>
                     {booking.status === 'Upcoming' && (
                        <button className="flex justify-center items-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                           <XCircle size={14} /> Cancel Booking
                        </button>
                     )}
                  </div>
               </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
