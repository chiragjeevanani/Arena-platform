import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Building2, Calendar, Clock, Banknote,
  CreditCard, CheckCircle2, Loader2, AlertCircle, ChevronRight, Wallet
} from 'lucide-react';
import { getWalkinCourts, getWalkinSlots, createWalkinBooking } from '../../../services/arenaStaffApi';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',  icon: Banknote,    color: '#16a34a' },
  { id: 'card',  label: 'Card',  icon: CreditCard,  color: '#2563eb' },
  { id: 'waived',label: 'Waived',icon: Wallet,      color: '#9333ea' },
];

const STEPS = ['court', 'slot', 'customer', 'confirm'];

export default function WalkInBookingModal({ onClose, onSuccess }) {
  const [step, setStep]           = useState(0); // index into STEPS
  const [courts, setCourts]       = useState([]);
  const [slots, setSlots]         = useState([]);
  const [loadingCourts, setLC]    = useState(true);
  const [loadingSlots, setLS]     = useState(false);
  const [submitting, setSub]      = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(null);

  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate]   = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [customerName, setCustomerName]   = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Fetch courts on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getWalkinCourts();
        setCourts(res.courts || []);
      } catch (e) {
        setError(e.message || 'Failed to load courts');
      } finally {
        setLC(false);
      }
    })();
  }, []);

  // Fetch slots when court + date changes
  const fetchSlots = useCallback(async (courtId, date) => {
    if (!courtId || !date) return;
    setLS(true);
    setSlots([]);
    setSelectedSlot(null);
    setError('');
    try {
      const res = await getWalkinSlots(courtId, date);
      setSlots(res.slots || []);
    } catch (e) {
      setError(e.message || 'Failed to load slots');
    } finally {
      setLS(false);
    }
  }, []);

  const handleSelectCourt = (court) => {
    setSelectedCourt(court);
    setStep(1);
    fetchSlots(court.id, selectedDate);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedCourt) fetchSlots(selectedCourt.id, date);
  };

  const handleSelectSlot = (slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) { setError('Customer name is required'); return; }
    setSub(true);
    setError('');
    try {
      const res = await createWalkinBooking({
        courtId: selectedCourt.id,
        date: selectedDate,
        timeSlot: selectedSlot.timeSlot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        amount: selectedSlot.price ?? 0,
      });
      setSuccess(res.booking);
      setStep(3);
      onSuccess?.(res.booking);
    } catch (e) {
      setError(e.message || 'Booking failed');
    } finally {
      setSub(false);
    }
  };

  const stepLabel = ['Select Court', 'Choose Slot', 'Customer Info', 'Confirmed'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#36454F] px-6 py-5 text-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Walk-In Booking</p>
              <h2 className="text-lg font-black mt-0.5">New Reservation</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 flex-1">
                <div className={`flex items-center gap-1.5 flex-1 ${i > step ? 'opacity-40' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                    i < step ? 'bg-[#CE2029] border-[#CE2029] text-white' :
                    i === step ? 'bg-white border-white text-[#36454F]' :
                    'bg-transparent border-white/40 text-white/60'
                  }`}>
                    {i < step ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">{stepLabel[i]}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={12} className="text-white/30 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center gap-2 shrink-0"
            >
              <AlertCircle size={14} className="text-[#CE2029] shrink-0" />
              <p className="text-[11px] font-bold text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <AnimatePresence mode="wait">

            {/* STEP 0: Select Court */}
            {step === 0 && (
              <motion.div key="court" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Select a Court</h3>
                {loadingCourts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-[#CE2029]" size={24} />
                  </div>
                ) : courts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Building2 size={40} strokeWidth={1} className="mx-auto mb-3" />
                    <p className="text-xs font-bold uppercase">No active courts found</p>
                  </div>
                ) : courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => handleSelectCourt(court)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-[#CE2029]/5 hover:border-[#CE2029]/30 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#CE2029] shadow-sm shrink-0 group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                      <Building2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-[#36454F]">{court.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{court.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-[#CE2029] text-sm">OMR {(court.pricePerHour ?? 0).toFixed(3)}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">/ hour</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* STEP 1: Choose Date + Slot */}
            {step === 1 && (
              <motion.div key="slot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Choose Date & Slot</h3>
                  <button onClick={() => setStep(0)} className="text-[10px] font-black text-[#CE2029] hover:underline uppercase tracking-widest">← Change Court</button>
                </div>

                {/* Selected Court Summary */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#CE2029]/5 border border-[#CE2029]/10">
                  <Building2 size={16} className="text-[#CE2029]" />
                  <span className="text-xs font-black text-[#36454F]">{selectedCourt?.name}</span>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Booking Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Slots Grid */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                    Available Time Slots {loadingSlots && <Loader2 size={10} className="inline animate-spin ml-1" />}
                  </label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#CE2029]" size={22} /></div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-8 text-slate-300">
                      <Clock size={32} strokeWidth={1} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase">No slots configured for this day</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.timeSlot}
                          onClick={() => handleSelectSlot(slot)}
                          disabled={!slot.available}
                          className={`p-3 rounded-xl text-left border transition-all ${
                            !slot.available
                              ? slot.isBlocked
                                ? 'bg-orange-50 border-orange-200 opacity-60 cursor-not-allowed'
                                : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                              : 'bg-white border-slate-200 hover:border-[#CE2029] hover:bg-[#CE2029]/5 cursor-pointer'
                          }`}
                        >
                          <p className="text-[11px] font-black text-[#36454F] leading-tight">{slot.timeSlot}</p>
                          <p className={`text-[9px] font-bold uppercase mt-1 ${
                            slot.isBlocked ? 'text-orange-500' :
                            slot.isBooked ? 'text-slate-400' :
                            'text-[#CE2029]'
                          }`}>
                            {slot.isBlocked ? 'Blocked' : slot.isBooked ? 'Booked' : `OMR ${(slot.price ?? 0).toFixed(3)}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Customer Info */}
            {step === 2 && (
              <motion.div key="customer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Customer Details</h3>
                  <button onClick={() => setStep(1)} className="text-[10px] font-black text-[#CE2029] hover:underline uppercase tracking-widest">← Change Slot</button>
                </div>

                {/* Booking Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  {[
                    { label: 'Court', value: selectedCourt?.name },
                    { label: 'Date', value: selectedDate },
                    { label: 'Slot', value: selectedSlot?.timeSlot },
                    { label: 'Amount', value: `OMR ${(selectedSlot?.price ?? 0).toFixed(3)}` },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.label}</span>
                      <span className="text-[12px] font-black text-[#36454F]">{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Customer Name */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Customer Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] placeholder:text-slate-300 outline-none focus:border-[#CE2029] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Phone Number (optional)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+968 XXXX XXXX"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] placeholder:text-slate-300 outline-none focus:border-[#CE2029] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map(({ id, label, icon: Icon, color }) => (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all font-bold text-[10px] uppercase ${
                          paymentMethod === id
                            ? 'border-[#CE2029] bg-[#CE2029]/5 text-[#CE2029]'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Icon size={18} style={{ color: paymentMethod === id ? '#CE2029' : color }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setError(''); setStep(3); handleSubmit(); }}
                  disabled={!customerName.trim() || submitting}
                  className="w-full py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#CE2029]/20"
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : 'Confirm Booking'}
                </button>
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {step === 3 && success && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8 gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <CheckCircle2 size={40} className="text-green-600" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-black text-[#36454F]">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-1">The slot has been reserved successfully.</p>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 text-left">
                  {[
                    { label: 'Customer', value: success.customerName },
                    { label: 'Court', value: success.courtName },
                    { label: 'Date', value: success.date },
                    { label: 'Time', value: success.timeSlot },
                    { label: 'Amount', value: `OMR ${(success.amount ?? 0).toFixed(3)}` },
                    { label: 'Payment', value: success.paymentMethod?.toUpperCase() },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.label}</span>
                      <span className="text-xs font-black text-[#36454F]">{r.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-[#36454F] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  Done
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
