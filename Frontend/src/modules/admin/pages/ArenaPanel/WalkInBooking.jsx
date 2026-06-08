import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Building2, Calendar, Clock, Banknote, Mail, Search, PlusCircle,
  CreditCard, CheckCircle2, Loader2, AlertCircle, ChevronRight, Wallet, MapPin, Check, X
} from 'lucide-react';
import { 
  getWalkinCourts, 
  getWalkinSlots, 
  createWalkinBooking,
  searchWalkinCustomers,
  createWalkinCustomer
} from '../../../../services/arenaStaffApi';
import { listAdminArenas } from '../../../../services/adminOpsApi';
import { useAuth } from '../../../user/context/AuthContext';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',  icon: Banknote,    color: '#16a34a' },
  { id: 'card',  label: 'Card',  icon: CreditCard,  color: '#2563eb' },
  { id: 'waived',label: 'Waived',icon: Wallet,      color: '#9333ea' },
];

const STEPS = ['arena', 'court', 'slot', 'customer', 'confirm'];
const STEP_LABELS = ['Select Arena', 'Select Court', 'Choose Slot', 'Customer Info', 'Confirmed'];

export default function WalkInBooking() {
  const { user } = useAuth();
  const { arenaId } = useArenaPanel();
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

  // Sync selectedArenaId with context's arenaId
  useEffect(() => {
    if (arenaId) {
      setSAID(arenaId);
      setStep(1);
    } else if (user?.role === 'SUPER_ADMIN') {
      setStep(0);
    }
  }, [arenaId, user]);

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
      if (!customerQuery.trim()) return;
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
    setSAID(arena.id || arena._id);
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
      let finalCustomerId = selectedCustomer?.id || selectedCustomer?._id;

      // Create new customer if needed
      if (isNewCustomer) {
        if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
          throw new Error('Name and Email are required for new customers');
        }
        const custRes = await createWalkinCustomer(newCustomer, selectedArenaId);
        finalCustomerId = custRes.customer.id || custRes.customer._id;
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
    } catch (e) {
      setError(e.message || 'Booking failed');
    } finally {
      setSub(false);
    }
  };

  const resetForm = () => {
    setStep(arenaId ? 1 : 0);
    setSelectedCourt(null);
    setSelectedSlot(null);
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedCustomer(null);
    setIsNewCustomer(false);
    setNewCustomer({ name: '', email: '', phone: '' });
    setCustomerQuery('');
    setCustomerResults([]);
    setSuccess(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-6 max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#36454F]">Walk-In Reservation Console</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Book courts and process transactions directly on premise</p>
        </div>
        
        {/* Step Progress indicators */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STEPS.map((s, i) => {
            // Hide arena step if arena is fixed via context
            if (s === 'arena' && arenaId) return null;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1.5 ${i > step ? 'opacity-40' : ''}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                    i < step ? 'bg-green-500 border-green-500 text-white' :
                    i === step ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-lg shadow-red-500/20' :
                    'bg-transparent border-slate-200 text-slate-400'
                  }`}>
                    {i < step ? <Check size={10} strokeWidth={4} /> : i + (arenaId ? 0 : 1)}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${i === step ? 'text-[#36454F]' : 'text-slate-400'}`}>
                    {STEP_LABELS[i]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={10} className="text-slate-300 shrink-0 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs font-bold text-red-600">{error}</p>
        </div>
      )}

      {/* Main Form Body */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {/* STEP 0: Arena Selection */}
          {step === 0 && !arenaId && (
            <motion.div key="step-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#36454F]/70 flex items-center gap-2">
                 <MapPin size={14} className="text-[#CE2029]" /> Select Operational Branch
              </p>
              {loadingArenas ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-[#CE2029]" size={28} />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Querying Arena Nodes...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {arenas.map(a => (
                    <button
                      key={a.id || a._id}
                      onClick={() => handleSelectArena(a)}
                      className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-[#CE2029] hover:shadow-xl hover:shadow-red-500/5 transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                          <Building2 size={22} />
                        </div>
                        <div>
                          <h4 className="font-black text-[#36454F] group-hover:text-[#CE2029] transition-colors uppercase tracking-wide">{a.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.location || 'Primary Hub'}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-200 group-hover:text-[#CE2029] transition-all" size={18} />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Court Selection */}
          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#36454F]/60 flex items-center gap-2">
                  <Building2 size={14} className="text-[#CE2029]" /> Select Facility Unit
                </p>
                {!arenaId && (
                  <button onClick={() => setStep(0)} className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest border-b border-[#CE2029]/20 hover:border-[#CE2029] transition-all">Switch Arena</button>
                )}
              </div>
              {loadingCourts ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-[#CE2029]" size={28} />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Grid Nodes...</p>
                </div>
              ) : courts.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Units Configured for this Arena</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {courts.map(c => (
                    <button
                      key={c.id || c._id}
                      onClick={() => handleSelectCourt(c)}
                      className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#CE2029] hover:shadow-xl hover:shadow-red-500/5 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#CE2029] group-hover:text-white transition-all mb-3">
                        <CheckCircle2 size={16} />
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
            <motion.div key="step-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Calendar size={14} /> Temporal Window
                    </p>
                    <h3 className="text-lg font-black text-[#36454F] mt-1 uppercase tracking-tight italic">{selectedCourt?.name}</h3>
                 </div>
                 <button onClick={() => setStep(1)} className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest border-b border-[#CE2029]/20 hover:border-[#CE2029] transition-all">Change Unit</button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-sm">
                <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] mb-2 block">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full bg-white h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-[#36454F] focus:outline-none focus:ring-2 focus:ring-[#CE2029]/20"
                />
              </div>

              {loadingSlots ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-[#CE2029]" size={24} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Timeline...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No slots available on this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {slots.map((s, i) => (
                    <button
                      key={i}
                      disabled={!s.available}
                      onClick={() => handleSelectSlot(s)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        s.available 
                          ? 'border-slate-100 bg-white hover:border-[#CE2029] hover:shadow-lg' 
                          : 'border-slate-50 bg-slate-50/50 opacity-45 cursor-not-allowed'
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

          {/* STEP 3: Customer Info & Settlement */}
          {step === 3 && (
            <motion.div key="step-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Customer Profile */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#36454F]/60 flex items-center gap-2">
                    <User size={14} className="text-[#CE2029]" /> Occupant Info
                  </p>
                  <button 
                    onClick={() => {
                      setIsNewCustomer(!isNewCustomer);
                      setSelectedCustomer(null);
                      setCustomerQuery('');
                    }} 
                    className="flex items-center gap-1 text-[10px] font-black text-[#CE2029] uppercase tracking-widest"
                  >
                    {isNewCustomer ? (
                      <><Search size={11} /> Search Existing</>
                    ) : (
                      <><PlusCircle size={11} /> Register New</>
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
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] px-1">Full Legal Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. Abdullah Al-Farsi"
                            value={newCustomer.name}
                            onChange={e => setNewCustomer(p => ({...p, name: e.target.value}))}
                            className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#36454F] focus:outline-none focus:ring-1 focus:ring-[#CE2029]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] px-1">Email Address</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            placeholder="name@domain.com"
                            value={newCustomer.email}
                            onChange={e => setNewCustomer(p => ({...p, email: e.target.value}))}
                            className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#36454F] focus:outline-none focus:ring-1 focus:ring-[#CE2029]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#36454F]/60 uppercase tracking-[0.2em] px-1">Phone Number</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="+968 XXXX XXXX"
                            value={newCustomer.phone}
                            onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))}
                            className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#36454F] focus:outline-none focus:ring-1 focus:ring-[#CE2029]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="search"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      {selectedCustomer ? (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-[#CE2029] relative overflow-hidden group">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#CE2029] text-white flex items-center justify-center">
                                 <User size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-black text-xs text-[#36454F] uppercase tracking-tight truncate">{selectedCustomer.name}</h4>
                                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5 truncate">
                                    <Mail size={9} /> {selectedCustomer.email}
                                 </p>
                              </div>
                              <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="w-8 h-8 rounded-lg hover:bg-red-100 text-red-500 transition-colors flex items-center justify-center"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                           <div className="absolute top-0 right-0 p-1 bg-[#CE2029] text-white rounded-bl-lg">
                              <Check size={8} strokeWidth={4} />
                           </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={customerQuery}
                            onChange={e => setCustomerQuery(e.target.value)}
                            className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#36454F] focus:outline-none focus:ring-1 focus:ring-[#CE2029] transition-all uppercase tracking-wide"
                          />
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                               <Loader2 className="animate-spin text-[#CE2029]" size={14} />
                            </div>
                          )}
                        </div>
                      )}

                      {!selectedCustomer && customerResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-50 max-h-48 overflow-y-auto"
                        >
                          {customerResults.map(c => (
                            <button
                              key={c.id || c._id}
                              onClick={() => setSelectedCustomer(c)}
                              className="w-full p-3 hover:bg-slate-50 text-left flex items-center gap-2.5 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                                 <User size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-[#36454F] uppercase tracking-wide truncate">{c.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 truncate">
                                   <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                      <Mail size={8} /> {c.email}
                                   </p>
                                   <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                      <Phone size={8} /> {c.phone || 'N/A'}
                                   </p>
                                </div>
                              </div>
                              <PlusCircle size={12} className="text-slate-200 group-hover:text-[#CE2029] transition-all" />
                            </button>
                          ))}
                        </motion.div>
                      )}

                      {!selectedCustomer && customerQuery.length >= 2 && !isSearching && customerResults.length === 0 && (
                        <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">No profiles found</p>
                           <button 
                            onClick={() => {
                              setIsNewCustomer(true);
                              setNewCustomer(p => ({ ...p, name: customerQuery }));
                            }}
                            className="px-4 py-2 rounded-lg bg-[#36454F] text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                           >
                              Register as New
                           </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Settlement Summary */}
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#36454F]/60 flex items-center gap-2">
                  <Banknote size={14} className="text-[#CE2029]" /> Settlement Info
                </p>

                <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-4">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                     <CreditCard size={10} /> Settlement Mode
                  </p>
                  <div className="flex gap-2">
                    {PAYMENT_METHODS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex-1 p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1.5 ${
                          paymentMethod === m.id
                            ? 'bg-white border-white text-slate-900 shadow-lg'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <m.icon size={14} className={paymentMethod === m.id ? 'text-[#CE2029]' : 'text-white/40'} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Summary row */}
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between font-bold text-white/60">
                      <span>Facility Unit:</span>
                      <span className="text-white font-black">{selectedCourt?.name}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white/60">
                      <span>Temporal Slot:</span>
                      <span className="text-white font-black">{selectedSlot?.timeSlot}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white/60">
                      <span>Date:</span>
                      <span className="text-white font-black">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                      <span className="text-xs font-black text-white uppercase tracking-widest">Total Bill</span>
                      <span className="text-lg font-black text-[#CE2029]">{selectedSlot?.price ?? 0} OMR</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success Confirmation */}
          {step === 4 && success && (
            <motion.div key="step-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 text-green-500 shadow-inner">
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-[#36454F] uppercase tracking-tight italic">Entry Authorized</h3>
              <p className="text-slate-400 font-bold mt-1.5 uppercase text-[9px] tracking-widest">Transmission Successful • System Log Updated</p>
              
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2.5 text-xs">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</span>
                    <span className="font-black text-[#36454F] uppercase">{success.id?.slice(-8) || success._id?.slice(-8) || 'N/A'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupant</span>
                    <span className="font-black text-[#36454F] uppercase">{success.customerName || 'Walkin Customer'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporal Window</span>
                    <span className="font-black text-[#36454F] uppercase">{success.timeSlot}</span>
                 </div>
                 <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement</span>
                    <span className="font-black text-green-600 uppercase">{success.amount} OMR • {success.paymentMethod}</span>
                 </div>
              </div>

              <button
                onClick={resetForm}
                className="mt-6 px-8 py-3 rounded-xl bg-[#36454F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md"
              >
                Book Another Slot
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer controls for steps */}
      {step > 0 && step < 4 && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
           <button
             onClick={() => setStep(s => s - 1)}
             className="h-10 px-5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#36454F] transition-colors"
           >
             Go Back
           </button>
           {step === 3 && (
             <button
               onClick={handleSubmit}
               disabled={submitting || (!selectedCustomer && !isNewCustomer)}
               className="px-6 h-10 bg-[#CE2029] text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-red-700 transition-all shadow-md disabled:opacity-40"
             >
               {submitting ? <Loader2 className="animate-spin" size={12} /> : (
                 <>Authorize Entry <ChevronRight size={12} /></>
               )}
             </button>
           )}
        </div>
      )}
    </div>
  );
}
