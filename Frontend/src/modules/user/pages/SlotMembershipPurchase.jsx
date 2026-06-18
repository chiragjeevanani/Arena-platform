import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Star, CreditCard, Grid3X3, AlertCircle, ChevronRight,
  Zap, Crown, Lock, Smartphone, Landmark, Banknote, Wallet
} from 'lucide-react';
import { fetchArenaSlotPricing, fetchArenaCourts, purchaseSlotMembership, getMyPointsWallet } from '../../../services/slotMembershipApi';
import { getMyWallet } from '../../../services/meApi';
import { apiJson } from '../../../services/apiClient';

// ─── Data ─────────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  {
    months: 1, label: '1 Month', durationDays: 30,
    desc: 'Perfect for trying out a recurring slot',
    gradient: 'from-blue-600 to-cyan-500',
    lightBg: 'bg-blue-50', lightText: 'text-blue-600', border: 'border-blue-200',
    saving: null,
  },
  {
    months: 3, label: '3 Months', durationDays: 90,
    desc: 'Commit to a quarter and save',
    gradient: 'from-emerald-600 to-teal-500',
    lightBg: 'bg-emerald-50', lightText: 'text-emerald-600', border: 'border-emerald-200',
    saving: '~17%',
  },
  {
    months: 6, label: '6 Months', durationDays: 180,
    desc: 'Our most popular choice',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50', lightText: 'text-amber-600', border: 'border-amber-200',
    saving: '~25%',
  },
  {
    months: 12, label: '12 Months', durationDays: 365,
    desc: 'Best value — lock in your court',
    gradient: 'from-[#CE2029] to-rose-500',
    lightBg: 'bg-red-50', lightText: 'text-[#CE2029]', border: 'border-red-200',
    saving: '~33%',
    badge: 'Best Value',
  },
];

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

function formatPrice(n) {
  return `OMR ${Number(n || 0).toFixed(3)}`;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function calculateMembershipEndDate(startDateStr, durationDays, activeDays) {
  if (!activeDays || activeDays.length === 0) {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + durationDays - 1);
    return d.toISOString().slice(0, 10);
  }

  const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const targetDays = new Set(activeDays.map(d => DAY_MAP[d]));

  const cursor = new Date(startDateStr);
  let playDaysCount = 0;
  
  for (let i = 0; i < 2000; i++) {
    const dayOfWeek = cursor.getDay();
    if (targetDays.has(dayOfWeek)) {
      playDaysCount++;
    }
    if (playDaysCount === durationDays) {
      return cursor.toISOString().slice(0, 10);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + durationDays - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Step indicators ─────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Duration', icon: Calendar },
  { label: 'Arena & Court', icon: MapPin },
  { label: 'Select Slots', icon: Grid3X3 },
  { label: 'Confirm & Pay', icon: CreditCard },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  : active ? 'bg-[#CE2029] text-white shadow-lg shadow-red-200'
                  : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </motion.div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                active ? 'text-[#CE2029]' : done ? 'text-emerald-600' : 'text-slate-400'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Duration ─────────────────────────────────────────────────────────
function Step1Duration({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#36454F] tracking-tight">Choose your membership duration</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Lock in recurring court slots for a fixed period. Pricing is per-membership regardless of how many slots you pick.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DURATION_OPTIONS.map((opt) => (
          <motion.button
            key={opt.months}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(opt)}
            className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
              selected?.months === opt.months
                ? `${opt.border} ${opt.lightBg} shadow-lg`
                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
            }`}
          >
            {opt.badge && (
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#CE2029] text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                {opt.badge}
              </div>
            )}
            {opt.saving && (
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${opt.lightBg} ${opt.lightText}`}>
                <Zap size={8} /> Save {opt.saving} vs monthly
              </div>
            )}
            <h3 className={`text-xl font-bold tracking-tight mb-1 ${selected?.months === opt.months ? opt.lightText : 'text-[#36454F]'}`}>
              {opt.label}
            </h3>
            <p className="text-xs font-medium text-slate-500">{opt.desc}</p>
            {selected?.months === opt.months && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-4 right-4 w-6 h-6 bg-[#CE2029] rounded-full flex items-center justify-center"
              >
                <CheckCircle2 size={14} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Arena & Court ────────────────────────────────────────────────────
function Step2ArenaAndCourt({ durationOpt, selectedArena, selectedCourt, onSelect }) {
  const [arenas, setArenas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courtsLoading, setCourtsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiJson('/api/public/arenas', { method: 'GET' })
      .then((d) => setArenas(d.arenas || []))
      .finally(() => setLoading(false));
  }, []);

  const loadCourtsAndPricing = useCallback(async (arena) => {
    setCourtsLoading(true);
    setPricing(null);
    setCourts([]);
    try {
      const [courtsData, pricingData] = await Promise.all([
        fetchArenaCourts(arena.id),
        fetchArenaSlotPricing(arena.id),
      ]);
      setCourts(courtsData.courts || []);
      setPricing(pricingData);
    } catch (e) {
      console.error(e);
    } finally {
      setCourtsLoading(false);
    }
  }, []);

  const handleArenaSelect = (arena) => {
    onSelect({ arena, court: null });
    loadCourtsAndPricing(arena);
  };

  const getPriceForDuration = (p) => {
    if (!p) return 0;
    const map = { 1: p.price1Month, 3: p.price3Month, 6: p.price6Month, 12: p.price12Month };
    return map[durationOpt.months] || 0;
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-[#36454F] tracking-tight">Select your arena & court</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Choose where you'd like to hold your recurring slot sessions.</p>
      </div>

      {/* Arena List */}
      {loading ? (
        <div className="text-center py-10 text-slate-400 text-sm font-bold">Loading arenas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {arenas.map((a) => (
            <button
              key={a.id}
              onClick={() => handleArenaSelect(a)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                selectedArena?.id === a.id
                  ? 'border-[#CE2029] bg-red-50 shadow-md shadow-red-100'
                  : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                {a.image ? (
                  <img src={a.image} alt={a.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <MapPin size={20} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm truncate ${selectedArena?.id === a.id ? 'text-[#CE2029]' : 'text-[#36454F]'}`}>{a.name}</p>
                  <p className="text-xs text-slate-400 font-bold truncate">{a.location || a.category}</p>
                </div>
                {selectedArena?.id === a.id && <CheckCircle2 size={18} className="text-[#CE2029] shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pricing Banner */}
      {selectedArena && pricing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl bg-gradient-to-r ${durationOpt.gradient} text-white`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{selectedArena.name} · {durationOpt.label} membership</p>
          <p className="text-3xl font-black tracking-tight">{formatPrice(getPriceForDuration(pricing))}</p>
          <p className="text-xs font-bold opacity-70 mt-1">Flat price — pick as many slots as you like</p>
        </motion.div>
      )}

      {/* Courts */}
      {selectedArena && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Select Court</p>
          {courtsLoading ? (
            <div className="text-sm text-slate-400 font-bold py-4">Loading courts...</div>
          ) : courts.length === 0 ? (
            <div className="text-sm text-slate-400 font-bold py-4">No courts found for this arena.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {courts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelect({ arena: selectedArena, court: c })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCourt?.id === c.id
                      ? 'border-[#CE2029] bg-red-50'
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className={`font-black text-sm ${selectedCourt?.id === c.id ? 'text-[#CE2029]' : 'text-[#36454F]'}`}>{c.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{c.type || 'Court'}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Select Slots ─────────────────────────────────────────────────────
// API now returns pre-grouped slots: { timeSlot, days[], courtSlotIds[], available, slotClass }
// Selecting one card = 1 membership slot (covers all configured days for that time).
function Step3SelectSlots({ courtId, selectedSlots, startDate, onStartDateChange, durationOpt, onSetSelectedSlots }) {
  const [groupedSlots, setGroupedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!courtId) return;
    setLoading(true);
    setErr('');
    apiJson(`/api/public/courts/${courtId}/slots?startDate=${startDate}&durationMonths=${durationOpt.months}`, { method: 'GET' })
      .then((d) => {
        const slots = d.slots || [];
        setGroupedSlots(slots);
        // Remove any previously selected slots that are no longer available
        const availableTimeslots = new Set(slots.filter(s => s.available).map(s => s.timeSlot));
        onSetSelectedSlots((prev) => prev.filter((s) => availableTimeslots.has(s.timeSlot)));
      })
      .catch((e) => setErr(e.message || 'Failed to load slots'))
      .finally(() => setLoading(false));
  }, [courtId, startDate, durationOpt.months, onSetSelectedSlots]);

  const selectedCount = selectedSlots.length;

  const handleToggle = (group) => {
    const isSelected = selectedSlots.some((s) => s.timeSlot === group.timeSlot);
    if (isSelected) {
      onSetSelectedSlots((prev) => prev.filter((s) => s.timeSlot !== group.timeSlot));
    } else {
      onSetSelectedSlots((prev) => [...prev, group]);
    }
  };

  const durationDays = durationOpt?.durationDays || (durationOpt?.months === 1 ? 30 : durationOpt?.months === 3 ? 90 : durationOpt?.months === 6 ? 180 : 365);
  const activeDays = [...new Set(selectedSlots.flatMap((s) => s.days || []))];
  const computedEndDate = calculateMembershipEndDate(startDate, durationDays, activeDays);

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-[#36454F] tracking-tight">Choose your recurring time slot</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Select a time slot. It will be booked for all configured days throughout your membership period.
          {selectedCount > 0 && (
            <span className="text-[#CE2029] ml-2 font-bold">
              {selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </p>
      </div>

      {/* Start Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Membership Start Date</label>
          <input
            type="date"
            min={getTodayStr()}
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:border-[#CE2029]"
          />
        </div>
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Membership End Date</span>
          <span className="text-sm font-black text-[#36454F]">{computedEndDate}</span>
          <p className="text-[9px] text-slate-400 font-bold mt-0.5">Duration: {durationOpt.label} ({durationDays} play days)</p>
        </div>
      </div>

      {err && <p className="text-sm text-red-600 font-bold">{err}</p>}

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-bold">Loading available slots...</div>
      ) : groupedSlots.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 font-bold">No configured slots for this court.</p>
          <p className="text-slate-300 text-sm font-bold mt-1">Contact the arena to set up court schedules.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-[#36454F]">Available Time Slots</span>
            <span className="text-[10px] font-bold text-slate-400">Covers all configured days</span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedSlots.map((group) => {
              const isSelected = selectedSlots.some((s) => s.timeSlot === group.timeSlot);
              const isAvailable = group.available;
              const dayLabels = group.days?.join(', ') || '';

              return (
                <motion.button
                  key={group.timeSlot}
                  whileHover={isAvailable ? { scale: 1.01 } : {}}
                  whileTap={isAvailable ? { scale: 0.99 } : {}}
                  onClick={() => isAvailable && handleToggle(group)}
                  disabled={!isAvailable}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 text-xs font-black transition-all duration-200 ${
                    !isAvailable
                      ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#CE2029] text-white border-[#CE2029] shadow-md shadow-red-200'
                      : 'border-slate-100 text-slate-600 bg-slate-50/50 hover:border-[#CE2029]/40 hover:bg-red-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} className={!isAvailable ? 'text-slate-300' : isSelected ? 'text-white' : 'text-[#CE2029]'} />
                    <div className="text-left">
                      <p className={`text-sm font-black ${!isAvailable ? 'text-slate-300' : isSelected ? 'text-white' : 'text-[#36454F]'}`}>
                        {group.timeSlot}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {DAY_ORDER.map(d => {
                          const isActive = group.days?.includes(d);
                          return (
                            <span key={d} className={`text-[8px] font-bold px-1 rounded flex items-center justify-center h-4 min-w-[20px] ${
                               !isAvailable 
                                 ? (isActive ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-300 opacity-50')
                                 : isSelected
                                   ? (isActive ? 'bg-white text-[#CE2029]' : 'bg-white/20 text-white/50')
                                   : (isActive ? 'bg-[#CE2029]/10 text-[#CE2029]' : 'bg-slate-100 text-slate-300')
                            }`}>
                              {d}
                            </span>
                          )
                        })}
                      </div>
                      {!isAvailable && <p className="text-[9px] font-bold mt-1 text-slate-300">Already booked for this period</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.slotClass === 'prime' && (
                      <Crown size={14} className={!isAvailable ? 'text-slate-300' : isSelected ? 'text-amber-300' : 'text-amber-500'} />
                    )}
                    {isSelected && isAvailable && <CheckCircle2 size={16} className="text-white" />}
                    {!isAvailable && (
                      <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-200/50 rounded ml-1">
                        Booked
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#36454F] text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm font-medium flex-wrap text-center"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected</span>
          <span className="opacity-50 hidden sm:inline">·</span>
          <span className="text-xs font-normal opacity-70">Tap again to deselect</span>
        </motion.div>
      )}
    </div>
  );
}


// ─── Step 4: Confirm & Pay ────────────────────────────────────────────────────
function Step4Confirm({ durationOpt, arena, court, selectedSlots, arenaId, courtId, startDate, onSuccess }) {
  const [usePoints, setUsePoints] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [pointsWallet, setPointsWallet] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [err, setErr] = useState('');
  const [useWallet, setUseWallet] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  useEffect(() => {
    Promise.all([
      getMyWallet().catch(() => null),
      getMyPointsWallet().catch(() => null),
      fetchArenaSlotPricing(arenaId).catch(() => null),
    ]).then(([w, pw, p]) => {
      setWallet(w?.wallet || w);
      setPointsWallet(pw?.wallet || pw);
      setPricing(p);
    });
  }, [arenaId]);

  const basePrice = pricing
    ? ({ 1: pricing.price1Month, 3: pricing.price3Month, 6: pricing.price6Month, 12: pricing.price12Month }[durationOpt.months] || 0)
    : 0;

  const durationDays = durationOpt?.durationDays || (durationOpt?.months === 1 ? 30 : durationOpt?.months === 3 ? 90 : durationOpt?.months === 6 ? 180 : 365);
  const activeDays = [...new Set(selectedSlots.flatMap((s) => s.days || []))];
  const endDate = calculateMembershipEndDate(startDate, durationDays, activeDays);

  const walletDeduction = useWallet && wallet ? Math.min(basePrice, wallet.balance) : 0;
  const remainingDue = basePrice - walletDeduction;

  const purchase = async () => {
    setErr('');
    setPurchasing(true);
    try {
      await purchaseSlotMembership({
        arenaId,
        courtId,
        courtSlotIds: selectedSlots.flatMap((s) => s.courtSlotIds || []),
        durationMonths: durationOpt.months,
        startDate,
        usePoints,
        useWallet,
        paymentMethod: remainingDue > 0 ? selectedMethod : 'wallet',
      });
      onSuccess();
    } catch (e) {
      setErr(e.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-[#36454F] tracking-tight">Review & confirm</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Double-check your selection before paying.</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Membership Duration</p>
            <p className="text-lg font-black text-[#36454F]">{durationOpt.label}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-sm font-black ${durationOpt.lightBg} ${durationOpt.lightText}`}>
            {durationOpt.months} months
          </div>
        </div>
        <div className="p-5 flex items-center gap-3">
          <MapPin size={16} className="text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Location</p>
            <p className="font-black text-[#36454F] text-sm">{arena?.name} · {court?.name}</p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Selected Slots</p>
          <div className="flex flex-col gap-3">
            {selectedSlots.map((group) => (
              <div key={group.timeSlot} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#36454F]">
                  <Clock size={12} className="text-[#CE2029]" />{group.timeSlot}
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {DAY_ORDER.map(d => {
                    const isActive = group.days?.includes(d);
                    return (
                      <span key={d} className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-1 text-center min-w-[32px] ${isActive ? 'bg-[#CE2029] text-white shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                        {d}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Start Date</span>
          <p className="text-sm font-black text-[#36454F]">{startDate}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5">Membership ends: {endDate}</p>
        </div>
      </div>

      {/* Wallet Balance Integration */}
      {wallet && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border transition-all ${useWallet ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white'}`}>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wallet size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-[#36454F]">Pay with Arena Wallet</p>
                <p className="text-[10px] text-slate-500 font-bold">Available Balance: {formatPrice(wallet.balance)}</p>
              </div>
            </label>
          </div>

          {/* Other Payment Methods for remainder or full amount */}
          {(!useWallet || wallet.balance < basePrice) && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                {useWallet && wallet.balance > 0 ? "Pay Remaining Amount Via" : "Select Payment Method"}
              </span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'upi', name: 'UPI', icon: Smartphone, color: 'text-[#CE2029]', bg: 'bg-[#CE2029]/10' },
                  { id: 'card', name: 'Card', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { id: 'cash', name: 'Pay at Arena', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50/20' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSel = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSel ? 'border-[#CE2029] bg-red-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={14} className={m.color} />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isSel ? 'text-[#CE2029]' : 'text-slate-600'}`}>
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pointsWallet && (
            <button
              onClick={() => setUsePoints((v) => !v)}
              className={`w-full bg-white rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
                usePoints ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-amber-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${usePoints ? 'bg-amber-400' : 'bg-amber-50'}`}>
                <Star size={18} className={usePoints ? 'text-white' : 'text-amber-500'} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bonus Points</p>
                <p className="text-lg font-black text-[#36454F]">{pointsWallet.points || 0} pts</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                usePoints ? 'border-amber-400 bg-amber-400' : 'border-slate-300'
              }`}>
                {usePoints && <CheckCircle2 size={12} className="text-white" />}
              </div>
            </button>
          )}
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-500">Base Price ({durationOpt.label})</span>
          <span className="font-black text-[#36454F]">{formatPrice(basePrice)}</span>
        </div>
        {usePoints && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-amber-600">Points Discount</span>
            <span className="font-black text-amber-600">Applied at checkout</span>
          </div>
        )}
        {walletDeduction > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <span className="font-bold">Paid from Wallet</span>
            <span className="font-black">-{formatPrice(walletDeduction)}</span>
          </div>
        )}
        <div className="h-px bg-slate-100" />
        <div className="flex items-center justify-between">
          <span className="font-black text-[#36454F]">{remainingDue > 0 ? "Total Due (Remaining)" : "Total Due"}</span>
          <span className="text-2xl font-black text-[#CE2029]">{formatPrice(remainingDue)}</span>
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-bold">{err}</p>
        </div>
      )}

      <button
        onClick={purchase}
        disabled={purchasing || selectedSlots.length === 0}
        className="w-full py-3 bg-[#CE2029] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#b01b22] active:scale-[0.99] transition-all disabled:opacity-50 shadow-xl shadow-[#CE2029]/20 flex-nowrap whitespace-nowrap"
      >
        {purchasing ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock size={14} className="shrink-0" />
            <span>Confirm & Purchase · {formatPrice(remainingDue)}</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SlotMembershipPurchase = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [durationOpt, setDurationOpt] = useState(null);
  const [selectedArena, setSelectedArena] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]); // Array of grouped slot objects: { timeSlot, days[], courtSlotIds[], available }
  const [startDate, setStartDate] = useState(getTodayStr());
  const [success, setSuccess] = useState(false);

  const canGoNext = () => {
    if (step === 0) return !!durationOpt;
    if (step === 1) return !!selectedArena && !!selectedCourt;
    if (step === 2) return selectedSlots.length > 0;
    return false;
  };

  // Reset slots when court changes
  const handleArenaCourtSelect = ({ arena, court }) => {
    setSelectedArena(arena);
    setSelectedCourt(court);
    if (court?.id !== selectedCourt?.id) setSelectedSlots([]);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-[#36454F] mb-2">Membership Activated!</h2>
          <p className="text-slate-500 font-bold text-sm mb-2">
            Your {durationOpt?.label} slot membership at <strong>{selectedArena?.name}</strong> is now active.
          </p>
          <p className="text-xs text-slate-400 font-bold mb-8">
            {selectedSlots.length} recurring slot{selectedSlots.length !== 1 ? 's' : ''} locked in on {selectedCourt?.name}.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-3.5 bg-[#CE2029] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#b01b22] transition-all"
          >
            Go to Profile
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-sans">
      {/* Top Bar */}
      <div className="px-4 md:px-6 pt-3 pb-3 md:pt-4 md:pb-4 bg-[#CE2029] rounded-b-3xl md:rounded-b-[2rem] shadow-[0_10px_30px_rgba(206,32,41,0.15)] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3 md:gap-4">
          <button
            onClick={() => step > 0 ? setStep((s) => s - 1) : navigate(-1)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm md:text-base font-medium font-display text-white tracking-wide uppercase leading-tight">
              Slot Membership <span className="opacity-80 text-xs ml-1 font-normal normal-case tracking-normal">Purchase Wizard</span>
            </h1>
          </div>
          <div className="ml-auto text-[9px] md:text-[10px] font-medium text-white/80 uppercase tracking-wider shrink-0 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            Step {step + 1} / {STEPS.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <Step1Duration selected={durationOpt} onSelect={setDurationOpt} />
            )}
            {step === 1 && (
              <Step2ArenaAndCourt
                durationOpt={durationOpt}
                selectedArena={selectedArena}
                selectedCourt={selectedCourt}
                onSelect={handleArenaCourtSelect}
              />
            )}
            {step === 2 && (
              <Step3SelectSlots
                courtId={selectedCourt?.id}
                selectedSlots={selectedSlots}
                startDate={startDate}
                onStartDateChange={setStartDate}
                durationOpt={durationOpt}
                onSetSelectedSlots={setSelectedSlots}
              />
            )}
            {step === 3 && (
              <Step4Confirm
                durationOpt={durationOpt}
                arena={selectedArena}
                court={selectedCourt}
                selectedSlots={selectedSlots}
                arenaId={selectedArena?.id}
                courtId={selectedCourt?.id}
                startDate={startDate}
                onSuccess={() => setSuccess(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canGoNext()}
              className="flex-1 max-w-xs ml-auto flex items-center justify-center gap-2 py-3 bg-[#CE2029] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#b01b22] transition-all disabled:opacity-40 shadow-lg shadow-[#CE2029]/20"
            >
              {step === 2 ? 'Review & Pay' : 'Continue'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotMembershipPurchase;
