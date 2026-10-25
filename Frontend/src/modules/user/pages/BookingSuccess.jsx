import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Share2, Download, Receipt, Home, CalendarDays, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import { useTheme } from '../context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { shouldPersistBookingSuccessToUserBookings } from '../../../utils/bookingSuccessPersistence';
import { storage } from '../../../utils/storage';
import Logo from '../../../assets/Logo (3).png';
import { useAuth } from '../context/AuthContext';
import { useCart, cartItemKey } from '../context/CartContext';
import { buildReceiptFromSuccessState, downloadBookingReceiptPdf } from '../../../utils/bookingReceiptPdf';
import ReceiptPreview from '../components/ReceiptPreview';

// Shuttlecock particle for confetti
const ShuttleParticle = ({ delay, x, y, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [0, y],
      x: [0, x],
      scale: [0, 1, 0.5],
      rotate: [0, 360],
    }}
    transition={{ duration: 2, delay, ease: 'easeOut' }}
    className={`absolute top-1/2 left-1/2 ${isDark ? 'text-[#CE2029]/30' : 'text-[#CE2029]/20'}`}
  >
    <ShuttlecockIcon size={16} />
  </motion.div>
);

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const courtRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [loadedBooking, setLoadedBooking] = useState(null);
  const [, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  const searchParams = new URLSearchParams(useLocation().search);
  const queryBookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (queryBookingId && !state) {
      setLoading(true);
      import('../../../services/bookingsApi').then(({ listMyBookings }) => {
        listMyBookings()
          .then((res) => {
            const found = res.bookings?.find((b) => b.id === queryBookingId);
            if (found) {
              setLoadedBooking({
                amount: found.price || found.amount || 0,
                arena: { name: found.arenaName, location: found.location || 'Muscat, Oman' },
                court: { name: found.courtName, type: 'BWF Approved' },
                date: found.date,
                slot: { time: found.slot },
                booking: found,
              });
            }
          })
          .catch((err) => console.error('Fetch booking error', err))
          .finally(() => setLoading(false));
      });
    }
  }, [queryBookingId, state]);

  // Shuttle particles — random once per mount, not on every render
  const [particles] = useState(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 400,
  })));

  const bookingData = state || loadedBooking;
  const bookingLines = Array.isArray(bookingData?.lines) ? bookingData.lines : [];

  // The receipt is built from the server's bookings whenever we know their ids — after a
  // Bank Muscat payment the app-side checkout details can be missing (the bank page may
  // open in a fresh browser context), but the payment always carries its booking ids.
  const isCourtBooking = !bookingData?.type || bookingData.type === 'booking';
  const receiptIdsKey = isCourtBooking
    ? [...new Set([
      ...bookingLines.map((l) => l.bookingId),
      ...(Array.isArray(bookingData?.bookings) ? bookingData.bookings.map((x) => x?.id) : []),
      ...(Array.isArray(bookingData?.payment?.meta?.bookingIds) ? bookingData.payment.meta.bookingIds : []),
      bookingData?.payment?.meta?.bookingId,
      bookingData?.booking?.id,
      queryBookingId,
    ].filter(Boolean).map(String))].join(',')
    : '';
  const [serverReceiptData, setServerReceiptData] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  useEffect(() => {
    if (!receiptIdsKey) return undefined;
    const ids = new Set(receiptIdsKey.split(','));
    let cancelled = false;
    setLoadingReceipt(true);
    import('../../../services/bookingsApi')
      .then(({ listMyBookings }) => listMyBookings())
      .then((res) => {
        if (cancelled) return;
        const mine = (res.bookings || []).filter((x) => ids.has(String(x.id)));
        if (!mine.length) return;
        mine.sort((x, y) => String(x.date).localeCompare(String(y.date)) || String(x.timeSlot).localeCompare(String(y.timeSlot)));
        setServerReceiptData({
          ...(bookingData || {}),
          type: 'booking',
          lines: mine.map((x) => ({
            bookingId: x.id,
            courtId: x.courtId,
            courtName: x.courtName,
            arenaName: x.arenaName,
            date: x.date,
            dateYmd: x.date,
            timeSlot: x.timeSlot,
            price: Number(x.finalPrice) || Number(x.amount) || 0,
            amount: Number(x.amount) || 0,
            pricingType: x.pricingType,
          })),
          amount: mine.reduce((s, x) => s + (Number(x.amount) || 0), 0),
          booking: mine[0],
          bookings: mine,
          couponCode: mine.find((x) => x.couponCode)?.couponCode || bookingData?.couponCode || null,
          couponDiscount: mine.reduce((s, x) => s + (Number(x.couponDiscount) || 0), 0) || Number(bookingData?.couponDiscount) || 0,
        });
      })
      .catch((err) => console.error('Receipt bookings load failed', err))
      .finally(() => { if (!cancelled) setLoadingReceipt(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptIdsKey]);
  const receiptData = serverReceiptData || bookingData;
  const receipt = receiptData ? buildReceiptFromSuccessState(receiptData, user) : null;

  // Booked slots leave the cart (they may have come from it, or been re-picked directly).
  const { removeItems: removeCartItems } = useCart();
  useEffect(() => {
    if (bookingLines.length) removeCartItems(bookingLines.map((l) => cartItemKey(l)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData]);
  // Same for bookings reloaded from the server (checkout details lost on the bank round trip),
  // so paid slots never stay "selected" on the slot page afterwards.
  useEffect(() => {
    const lines = serverReceiptData?.lines || [];
    if (lines.length) removeCartItems(lines.map((l) => cartItemKey({ courtId: l.courtId, dateYmd: l.dateYmd, timeSlot: l.timeSlot })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverReceiptData]);

  useEffect(() => {
    // Save booking/enrollment to localStorage for persistence in Dashboard
    if (bookingData) {
      const existingBookings = JSON.parse(storage.getItem('userBookings') || '[]');

      let newBooking;
      if (bookingData.type === 'membership') {
        // Membership activation
        newBooking = {
          id: `MEM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          arenaName: "Arena Membership",
          arenaImage: null,
          location: "Global Access",
          courtName: bookingData.plan?.name,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          slot: bookingData.plan?.duration,
          status: 'Active',
          type: 'Membership',
          price: bookingData.amount
        };
        
        // Save membership status
        const membershipData = {
          status: 'active',
          planId: bookingData.plan?.id,
          planName: bookingData.plan?.name,
          category: bookingData.plan?.category,
          discountPercent: bookingData.plan?.discountPercent,
          startDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-04-02', // 1 year approx for demo
          benefits: bookingData.plan?.benefits
        };
        storage.setItem('userMembership', JSON.stringify(membershipData));
      } else if (bookingData.type === 'coaching' || bookingData.batch) {
        // Coaching enrollment
        newBooking = {
          id: bookingData.enrollment?.id ? String(bookingData.enrollment.id) : `AC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          arenaName: bookingData.batch?.arenaName || bookingData.arena?.name || 'Arena',
          arenaImage: bookingData.batch?.image || bookingData.arena?.image,
          location: bookingData.batch?.location || bookingData.arena?.location || 'Arena',
          coachName: bookingData.batch?.coachName,
          courtName: bookingData.batch?.level || 'Coaching',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          slot: bookingData.batch?.timing,
          status: 'Upcoming',
          type: 'Coaching',
          price: bookingData.amount,
        };
      } else {
        // Arena booking
        const apiId = bookingData.booking?.id ? String(bookingData.booking.id) : null;
        newBooking = {
          id: apiId || `BK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          arenaName: bookingData.arena?.name,
          arenaImage: bookingData.arena?.image,
          location: bookingData.arena?.location,
          courtName: bookingData.court?.name,
          date: bookingData.date,
          slot: bookingData.slot?.time,
          status: 'Upcoming',
          type: 'Booking',
          price: bookingData.amount
        };
      }

      const persist = shouldPersistBookingSuccessToUserBookings(bookingData, {
        apiConfigured: isApiConfigured(),
        hasToken: Boolean(getAuthToken()),
      });
      // Prevent duplicate saving on re-renders; skip local row when server is source of truth
      if (
        persist &&
        newBooking.id &&
        !existingBookings.find((b) => b.id === newBooking.id)
      ) {
        storage.setItem('userBookings', JSON.stringify([newBooking, ...existingBookings]));
      }
    }

    // Animated shuttle landing on court
    if (courtRef.current) {
      gsap.fromTo(courtRef.current,
        { y: -100, opacity: 0, scale: 1.5, rotation: -45 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1, delay: 0.5, ease: 'bounce.out' }
      );
    }

    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [bookingData]);

  return (
    <div className={`min-h-screen flex flex-col pt-8 md:pt-12 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Shuttlecock confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {particles.map(p => (
            <ShuttleParticle key={p.id} delay={p.delay} x={p.x} y={p.y} isDark={isDark} />
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full px-6 space-y-6 md:space-y-8 relative z-10 pb-28 lg:pb-16">
        {/* Success Icon Section */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] mx-auto flex items-center justify-center relative z-10 ${isDark ? 'bg-[#CE2029]/10 border-2 border-[#CE2029] shadow-lg shadow-[#CE2029]/20' : 'bg-white border-4 border-[#CE2029]/10 shadow-xl shadow-[#CE2029]/20'}`}
            >
              <Check size={28} strokeWidth={3} className={'text-[#CE2029]'} />
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-[24px] md:rounded-[28px] -m-1.5 md:-m-2.5 border-2 ${isDark ? 'border-[#CE2029]/30' : 'border-[#CE2029]/20'}`}
            />
          </div>

          <div className="max-w-md mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl md:text-3xl font-black tracking-tight font-display mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {bookingData?.type === 'membership' 
                ? 'Welcome to the Club!' 
                : bookingData?.type === 'wallet_top_up'
                ? 'Top Up Successful!'
                : bookingData?.batch 
                ? 'Ready for Training!' 
                : 'Slot Secured!'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}
            >
              {bookingData?.type === 'membership' 
                ? 'Your membership is now active' 
                : bookingData?.type === 'wallet_top_up'
                ? 'Your Arena Wallet has been credited'
                : bookingData?.batch 
                ? 'Your academic journey begins here' 
                : 'Prepare for your match at the arena'}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-3xl mx-auto">
          {/* Receipt — the same receipt the customer downloads as PDF (utils/bookingReceiptPdf). */}
          <motion.div
            id="print-area"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="lg:col-span-8 relative"
          >
            {receipt ? (
              <ReceiptPreview receipt={receipt} className="!shadow-2xl !rounded-[24px] mx-auto" />
            ) : (
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 text-center text-xs font-bold text-slate-400">
                Loading your receipt…
              </div>
            )}
            {loadingReceipt && receipt && (
              <p className="text-center text-[10px] font-bold text-slate-400 mt-2">Updating receipt…</p>
            )}
            {receiptData?.couponCode && Number(receiptData.couponDiscount) > 0 && (
              <p className="text-center text-[11px] font-bold text-green-600 mt-3">
                Coupon {receiptData.couponCode} saved you OMR {Number(receiptData.couponDiscount).toFixed(3)}
              </p>
            )}
          </motion.div>

          {/* Desktop Right Column: Quick Actions & Dashboard Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <h4 className={`text-[9px] font-black uppercase tracking-[0.25em] ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Actions</h4>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                <button 
                  onClick={() => {
                    const shareData = {
                      title: 'Arena Booking Confirmation',
                      text: `I just booked ${bookingData?.court?.name || 'a session'} at ${bookingData?.arena?.name || 'the arena'} for ${bookingData?.date} at ${bookingData?.slot?.time || 'requested slot'}. Join me!`,
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      navigator.share(shareData).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(shareData.text).then(() => {
                        alert('Booking details copied to clipboard!');
                      });
                    }
                  }}
                  className={`h-12 rounded-[20px] font-black text-[10px] border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-[#CE2029]/10 shadow-lg shadow-[#CE2029]/5 text-[#CE2029] hover:border-[#CE2029]/30'
                  }`}>
                  <Share2 size={16} className={isDark ? 'text-[#CE2029]' : 'text-[#CE2029]'} />
                  <span className="uppercase tracking-widest mt-0.5">Share</span>
                </button>
                <button 
                  disabled={isDownloading}
                  onClick={async () => {
                    setIsDownloading(true);
                    try {
                      await downloadBookingReceiptPdf(receipt || buildReceiptFromSuccessState(bookingData, user));
                    } catch (err) {
                      console.error('PDF Generation Error:', err);
                      window.print();
                    } finally {
                      setIsDownloading(false);
                    }
                  }}
                  className={`h-12 rounded-[20px] font-black text-[10px] border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-[#CE2029]/10 shadow-lg shadow-[#CE2029]/5 text-[#CE2029] hover:border-[#CE2029]/30'
                  }`}>
                  <Download size={16} className={isDark ? 'text-[#CE2029]' : 'text-[#CE2029]'} />
                  <span className="uppercase tracking-widest mt-0.5">Download</span>
                </button>
              </div>
            </div>
            
            {/* Simple Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page { margin: 12mm; size: A4 portrait; }
                html, body {
                  background: white !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  color: #0f172a !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                /* Hide everything except the receipt card */
                body * { visibility: hidden !important; }
                #print-area, #print-area * { visibility: visible !important; }

                #print-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 18px 20px !important;
                  border: 1px solid #e2e8f0 !important;
                  border-radius: 12px !important;
                  background: white !important;
                  box-shadow: none !important;
                  overflow: visible !important;
                  transform: none !important;
                  color: #0f172a !important;
                }

                #print-area .print\\:hidden,
                .print\\:hidden {
                  display: none !important;
                }

                /* Ticket side notches clip in print — hide them */
                #print-area .absolute.left-0.-translate-x-9,
                #print-area .absolute.right-0.translate-x-9,
                #print-area .absolute.left-0.md\\:-translate-x-10,
                #print-area .absolute.right-0.md\\:translate-x-10 {
                  display: none !important;
                }

                #print-area h1,
                #print-area h3,
                #print-area p,
                #print-area span {
                  color: inherit !important;
                }

                #print-area .text-\\[\\#CE2029\\],
                #print-area .text-\\[\\#CE2029\\]\\/80 {
                  color: #CE2029 !important;
                }
              }
            `}} />

            <div className={`p-5 rounded-[24px] border hidden lg:block ${isDark ? 'bg-gradient-to-br from-[#CE2029]/20 to-[#d43b33]/10 border-[#CE2029]/20' : 'bg-gradient-to-br from-[#CE2029] to-[#d43b33] shadow-xl shadow-[#CE2029]/30 text-white border-[#CE2029]'}`}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border ${isDark ? 'bg-[#CE2029]/10 border-[#CE2029]/20' : 'bg-white/10 border-white/20'}`}>
                  {bookingData?.redirectBack ? <Check size={20} className={isDark ? 'text-[#CE2029]' : 'text-white'} /> : <Home size={20} className={isDark ? 'text-[#CE2029]' : 'text-white'} />}
                </div>
                <div className="space-y-0.5">
                  <h4 className={`text-base font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-white'}`}>
                    {bookingData?.redirectBack ? 'Topped Up & Funded!' : 'Ready for more?'}
                  </h4>
                  <p className={`text-[8px] font-bold opacity-70 leading-relaxed uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-white/80'}`}>
                    {bookingData?.redirectBack ? 'Complete your membership purchase now.' : 'Dashboard updated.'}
                  </p>
                </div>
                <ShuttleButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    if (bookingData?.redirectBack) {
                      navigate(bookingData.redirectBack, {
                        state: { autoOpenPlanId: bookingData.pendingPlanId, toppedUp: true }
                      });
                    } else {
                      navigate('/home');
                    }
                  }}
                  className={`!rounded-[16px] py-3 transition-all shadow-lg text-[11px] ${isDark ? '!bg-[#CE2029] !text-white' : '!bg-white !text-[#CE2029] hover:scale-105'}`}
                >
                  {bookingData?.redirectBack ? 'Complete Purchase' : 'Dashboard'}
                </ShuttleButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sticky Footer - Mobile/Tablet Only */}
      <div className={`fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+var(--safe-bottom))] z-[60] lg:hidden border-t backdrop-blur-xl transition-all rounded-t-3xl ${isDark ? 'bg-[#0f1115]/90 border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-[#CE2029]/10 shadow-[0_-5px_30px_rgba(206, 32, 41,0.05)]'
        }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          icon={bookingData?.redirectBack ? <Check size={16} /> : <Home size={16} />}
          onClick={() => {
            if (bookingData?.redirectBack) {
              navigate(bookingData.redirectBack, {
                state: { autoOpenPlanId: bookingData.pendingPlanId, toppedUp: true }
              });
            } else {
              navigate('/home');
            }
          }}
          className="shadow-md shadow-[#CE2029]/20 !rounded-2xl active:scale-95 transition-all py-3 text-xs"
        >
          {bookingData?.redirectBack ? 'Complete Purchase' : 'Back to Dashboard'}
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSuccess;
