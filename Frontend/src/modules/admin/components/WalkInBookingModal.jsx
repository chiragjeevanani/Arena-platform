import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Building2, Calendar, Clock, Banknote, Mail, Search, PlusCircle,
  CreditCard, CheckCircle2, Loader2, AlertCircle, ChevronRight, Wallet, MapPin, Check
} from 'lucide-react';
import { 
  getWalkinCourts, 
  getWalkinSlots, 
  createWalkinBooking,
  searchWalkinCustomers,
  createWalkinCustomer
} from '../../../services/arenaStaffApi';
import { listAdminArenas } from '../../../services/adminOpsApi';
import { useAuth } from '../../user/context/AuthContext';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',  icon: Banknote,    color: '#16a34a' },
  { id: 'card',  label: 'Card',  icon: CreditCard,  color: '#2563eb' },
  { id: 'waived',label: 'Waived',icon: Wallet,      color: '#9333ea' },
];

const STEPS = ['arena', 'court', 'slot', 'customer', 'confirm'];

export default function WalkInBookingModal({ onClose, onSuccess, arenaId }) {
  const { user } = useAuth();
  const [step, setStep]           = useState(arenaId ? 1 : 0); 
  const [arenas, setArenas]       = useState([]);
  const [courts, setCourts]       = useState([]);
  const [slots, setSlots]         = useState([]);
  const [loadingArenas, setLA]    = useState(!arenaId && user?.role === 'SUPER_ADMIN');
  const [loadingCourts, setLC]    = useState(!!arenaId);
  const [loadingSlots, setLS]     = useState(false);
  const [submitting, setSub]      = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(null);

  const [selectedArenaId, setSAID]         = useState(arenaId || '');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate]   = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Customer State
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  // Fetch arenas if needed
  useEffect(() => {
    if (!arenaId && user?.role === 'SUPER_ADMIN') {
      (async () => {
        try {
          const res = await listAdminArenas();
          setArenas(res.arenas || []);
        } catch (e) {
          setError(e.message || 'Failed to load arenas');
        } finally {
          setLA(false);
        }
      })();
    }
  }, [arenaId, user]);

  // Fetch courts when arena is selected
  const fetchCourts = useCallback(async (aid) => {
    if (!aid) return;
    setLC(true);
    setCourts([]);
    setSelectedCourt(null);
    try {
      const res = await getWalkinCourts(aid);
      setCourts(res.courts || []);
    } catch (e) {
      setError(e.message || 'Failed to load courts');
    } finally {
      setLC(false);
    }
  }, []);

  useEffect(() => {
    if (selectedArenaId) {
      fetchCourts(selectedArenaId);
    }
  }, [selectedArenaId, fetchCourts]);

  // Fetch slots when court + date changes
  const fetchSlots = useCallback(async (courtId, date, aid) => {
    if (!courtId || !date || !aid) return;
    setLS(true);
    setSlots([]);
    setSelectedSlot(null);
    setError('');
    try {
      const res = await getWalkinSlots(courtId, date, aid);
      setSlots(res.slots || []);
    } catch (e) {
      setError(e.message || 'Failed to load slots');
    } finally {
      setLS(false);
    }
  }, []);

  // Debounced Customer Search
  useEffect(() => {
    if (isNewCustomer || selectedCustomer) {
      setCustomerResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchWalkinCustomers(customerQuery, selectedArenaId);
        setCustomerResults(res.customers || []);
      } catch (e) {
        console.error('Customer search failed:', e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [customerQuery, isNewCustomer, selectedCustomer, selectedArenaId, step]);

  const handleSelectArena = (arena) => {
    setSAID(arena.id);
    setStep(1);
  };

  const handleSelectCourt = (court) => {
    setSelectedCourt(court);
    setStep(2);
    fetchSlots(court.id, selectedDate, selectedArenaId);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedCourt && selectedArenaId) fetchSlots(selectedCourt.id, date, selectedArenaId);
  };

  const handleSelectSlot = (slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleSubmit = async () => {
    setSub(true);
    setError('');
    try {
      let finalCustomerId = selectedCustomer?.id;

      // Create new customer if needed
      if (isNewCustomer) {
        if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
          throw new Error('Name and Email are required for new customers');
        }
        const custRes = await createWalkinCustomer(newCustomer, selectedArenaId);
        finalCustomerId = custRes.customer.id;
      }

      if (!finalCustomerId) {
        throw new Error('Please select or create a customer');
      }

      const res = await createWalkinBooking({
        courtId: selectedCourt.id,
        date: selectedDate,
        timeSlot: selectedSlot.timeSlot,
        customerId: finalCustomerId,
        paymentMethod,
        amount: selectedSlot.price ?? 0,
      }, selectedArenaId);

      setSuccess(res.booking);
      setStep(4);
      onSuccess?.(res.booking);
    } catch (e) {
      setError(e.message || 'Booking failed');
    } finally {
      setSub(false);
    }
  };

  const stepLabel = ['Select Arena', 'Select Court', 'Choose Slot', 'Customer Info', 'Confirmed'];

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
              <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Walk-In Booking</p>
              <h2 className="text-xl font-black mt-0.5 text-white tracking-tight">New Reservation</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 flex-1">
                <div className={`flex items-center gap-1.5 flex-1 ${i > step ? 'opacity-60' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                    i < step ? 'bg-emerald-500 border-emerald-500 text-white' :
                    i === step ? 'bg-white border-white text-[#36454F] shadow-lg shadow-white/20' :
                    'bg-transparent border-white/20 text-white/80'
                  }`}>
                    {i < step ? <Check size={12} strokeWidth={4} /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:block ${i === step ? 'text-white' : 'text-white/60'}`}>
                    {stepLabel[i]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={12} className="text-white/20 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3"
              >
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-sm font-bold text-red-600">{error}</p>
              </motion.div>
            )}

            {/* STEP 0: Arena Selection */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#36454F]/70 mb-4 flex items-center gap-2">
                   <MapPin size={14} className="text-[#CE2029]" /> Select Operational Branch
                </p>
                {loadingArenas ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-[#CE2029]" size={32} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Querying Arena Nodes...</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {arenas.map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleSelectArena(a)}
                        className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-[#CE2029] hover:shadow-xl hover:shadow-red-500/5 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                            <Building2 size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-black text-[#36454F] group-hover:text-[#CE2029] transition-colors uppercase tracking-wide">{a.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.location || 'Primary Hub'}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-[#CE2029] transition-all" size={20} />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 1: Court Selection */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#36454F]/40 flex items-center gap-2">
                    <Building2 size={14} /> Select Facility Unit
                  </p>
                  {!arenaId && (
                    <button onClick={() => setStep(0)} className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest border-b border-[#CE2029]/20 hover:border-[#CE2029] transition-all">Switch Arena</button>
                  )}
                </div>
                {loadingCourts ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-[#CE2029]" size={32} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Grid Nodes...</p>
                  </div>
                ) : courts.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Active Units Detected</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {courts.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCourt(c)}
                        className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#CE2029] hover:shadow-xl hover:shadow-red-500/5 transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#CE2029] group-hover:text-white transition-all mb-3">
                          <CheckCircle2 size={18} />
                        </div>
                        <h4 className="font-black text-[#36454F] uppercase tracking-tighter leading-tight">{c.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{c.type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Slot Selection */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#36454F]/40 flex items-center gap-2">
                        <Calendar size={14} /> Temporal Window
                      </p>
                      <h3 className="text-lg font-black text-[#36454F] mt-1 uppercase tracking-tight italic">{selectedCourt?.name}</h3>
                   </div>
                   <button onClick={() => setStep(1)} className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest">Change Unit</button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] mb-2 block">Target Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-white h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-[#36454F] focus:outline-none focus:ring-2 focus:ring-[#CE2029]/20"
                  />
                </div>

                {loadingSlots ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-[#CE2029]" size={24} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Timeline...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s, i) => (
                      <button
                        key={i}
                        disabled={!s.available}
                        onClick={() => handleSelectSlot(s)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          s.available 
                            ? 'border-slate-100 bg-white hover:border-[#CE2029] hover:shadow-lg' 
                            : 'border-slate-50 bg-slate-50/50 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Clock size={12} className={s.available ? 'text-[#CE2029]' : 'text-slate-300'} />
                          <span className="text-[9px] font-black text-[#36454F]">{s.price} OMR</span>
                        </div>
                        <p className="text-[11px] font-black text-[#36454F] tracking-tighter uppercase">{s.timeSlot}</p>
                        {!s.available && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1 block">Occupied</span>
                        )}
                        {s.available && (
                           <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlusCircle size={14} className="text-[#CE2029]" />
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Customer Info */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#36454F]/40 flex items-center gap-2">
                    <User size={14} /> Occupant Protocol
                  </p>
                  <button 
                    onClick={() => {
                      setIsNewCustomer(!isNewCustomer);
                      setSelectedCustomer(null);
                      setCustomerQuery('');
                    }} 
                    className="flex items-center gap-1.5 text-[10px] font-black text-[#CE2029] uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    {isNewCustomer ? (
                      <><Search size={12} /> Search Existing</>
                    ) : (
                      <><PlusCircle size={12} /> Register New</>
                    )}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {isNewCustomer ? (
                    <motion.div 
                      key="new"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] px-1">Full Legal Name</label>
                          <div className="relative">
                            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="e.g. Abdullah Al-Farsi"
                              value={newCustomer.name}
                              onChange={e => setNewCustomer(p => ({...p, name: e.target.value}))}
                              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#36454F] focus:outline-none focus:ring-2 focus:ring-[#CE2029]/20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] px-1">Email Address</label>
                            <div className="relative">
                              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="email"
                                placeholder="name@domain.com"
                                value={newCustomer.email}
                                onChange={e => setNewCustomer(p => ({...p, email: e.target.value}))}
                                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#36454F] focus:outline-none focus:ring-2 focus:ring-[#CE2029]/20"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] px-1">Phone Terminal</label>
                            <div className="relative">
                              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="tel"
                                placeholder="+968 XXXX XXXX"
                                value={newCustomer.phone}
                                onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))}
                                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#36454F] focus:outline-none focus:ring-2 focus:ring-[#CE2029]/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="search"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {selectedCustomer ? (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-[#CE2029] relative overflow-hidden group">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#CE2029] text-white flex items-center justify-center">
                                 <User size={24} />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-black text-[#36454F] uppercase tracking-tight">{selectedCustomer.name}</h4>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                    <Mail size={10} /> {selectedCustomer.email}
                                 </p>
                              </div>
                              <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="w-8 h-8 rounded-lg hover:bg-red-100 text-red-500 transition-colors flex items-center justify-center"
                              >
                                 <X size={16} />
                              </button>
                           </div>
                           <div className="absolute top-0 right-0 p-1 bg-[#CE2029] text-white rounded-bl-lg">
                              <Check size={10} strokeWidth={4} />
                           </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={customerQuery}
                            onChange={e => setCustomerQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-[#36454F] focus:outline-none focus:border-[#CE2029] transition-all shadow-sm uppercase tracking-wide"
                          />
                          {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                               <Loader2 className="animate-spin text-[#CE2029]" size={18} />
                            </div>
                          )}
                        </div>
                      )}

                      {!selectedCustomer && customerResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-50"
                        >
                          {customerResults.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCustomer(c)}
                              className="w-full p-4 hover:bg-slate-50 text-left flex items-center gap-3 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                                 <User size={18} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black text-[#36454F] uppercase tracking-wide">{c.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                      <Mail size={8} /> {c.email}
                                   </p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                      <Phone size={8} /> {c.phone || 'N/A'}
                                   </p>
                                </div>
                              </div>
                              <PlusCircle size={14} className="text-slate-200 group-hover:text-[#CE2029] transition-all" />
                            </button>
                          ))}
                        </motion.div>
                      )}

                      {!selectedCustomer && customerQuery.length >= 2 && !isSearching && customerResults.length === 0 && (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">No matching profiles found in database</p>
                           <button 
                            onClick={() => {
                              setIsNewCustomer(true);
                              setNewCustomer(p => ({ ...p, name: customerQuery }));
                            }}
                            className="px-6 py-2.5 rounded-full bg-[#36454F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                           >
                              Register as New Occupant
                           </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-5 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/10">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Banknote size={12} /> Settlement Configuration
                   </p>
                   <div className="flex gap-2">
                     {PAYMENT_METHODS.map(m => (
                       <button
                         key={m.id}
                         onClick={() => setPaymentMethod(m.id)}
                         className={`flex-1 p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                           paymentMethod === m.id
                             ? 'bg-white border-white text-slate-900'
                             : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                         }`}
                       >
                         <m.icon size={16} className={paymentMethod === m.id ? 'text-[#CE2029]' : 'text-white/40'} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                       </button>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Confirmation */}
            {step === 4 && success && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-[#36454F] uppercase tracking-tighter italic">Entry Authorized</h3>
                <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Transmission Successful • System Log Updated</p>
                
                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</span>
                      <span className="text-xs font-black text-[#36454F] uppercase tracking-wider">{success.id.slice(-8)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupant</span>
                      <span className="text-xs font-black text-[#36454F] uppercase tracking-wider">{success.customerName}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest"> temporal window</span>
                      <span className="text-xs font-black text-[#36454F] uppercase tracking-wider">{success.timeSlot}</span>
                   </div>
                   <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement</span>
                      <span className="text-xs font-black text-green-600 uppercase tracking-wider">{success.amount} OMR • {success.paymentMethod}</span>
                   </div>
                </div>

                <button
                  onClick={onClose}
                  className="mt-8 w-full h-14 rounded-2xl bg-[#36454F] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                >
                  Close Console
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step > 0 && step < 4 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0 flex items-center gap-3">
             <button
               onClick={() => setStep(s => s - 1)}
               className="h-12 px-6 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#36454F] transition-colors"
             >
               Go Back
             </button>
             {step === 3 && (
               <button
                 onClick={handleSubmit}
                 disabled={submitting || (!selectedCustomer && !isNewCustomer)}
                 className="flex-1 h-12 bg-[#CE2029] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-500/10 disabled:opacity-40"
               >
                 {submitting ? <Loader2 className="animate-spin" size={16} /> : (
                   <>Authorize Entry <ChevronRight size={14} /></>
                 )}
               </button>
             )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
