import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Star, CreditCard, Grid3X3, AlertCircle, ChevronRight,
  Zap, Crown, Lock
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
        <h2 className="text-2xl font-black text-[#36454F] tracking-tight">Choose your membership duration</h2>
        <p className="text-slate-500 text-sm font-bold mt-1">Lock in recurring court slots for a fixed period. Pricing is per-membership regardless of how many slots you pick.</p>
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
            <h3 className={`text-3xl font-black tracking-tight mb-1 ${selected?.months === opt.months ? opt.lightText : 'text-[#36454F]'}`}>
              {opt.label}
            </h3>
            <p className="text-xs font-bold text-slate-500">{opt.desc}</p>
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
        <h2 className="text-2xl font-black text-[#36454F] tracking-tight">Select your arena & court</h2>
        <p className="text-slate-500 text-sm font-bold mt-1">Choose where you'd like to hold your recurring slot sessions.</p>
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
function Step3SelectSlots({ courtId, selectedSlots, onToggleSlot, startDate, onStartDateChange, durationOpt, onSetSelectedSlots }) {
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!courtId) return;
    setLoading(true);
    setErr('');
    apiJson(`/api/public/courts/${courtId}/slots?startDate=${startDate}&durationMonths=${durationOpt.months}`, { method: 'GET' })
      .then((d) => {
        const slots = d.slots || [];
        setAllSlots(slots);

        const availableSlotsMap = {};
        slots.forEach((s) => {
          availableSlotsMap[s.id] = s.available;
        });

        // Filter out selected slots that are no longer available
        onSetSelectedSlots((prev) => prev.filter((s) => availableSlotsMap[s.id] === true));
      })
      .catch((e) => setErr(e.message || 'Failed to load slots'))
      .finally(() => setLoading(false));
  }, [courtId, startDate, durationOpt.months, onSetSelectedSlots]);

  // Find all distinct days configured for this court
  const distinctDays = [...new Set(allSlots.map((s) => s.dayOfWeek))];

  // Group slots by timeSlot
  const groupedSlots = {};
  allSlots.forEach((s) => {
    if (!groupedSlots[s.timeSlot]) {
      groupedSlots[s.timeSlot] = [];
    }
    groupedSlots[s.timeSlot].push(s);
  });

  // Filter groups to find those configured for all distinct days and see if they are available
  const uniqueTimeSlots = [];
  Object.entries(groupedSlots).forEach(([timeSlot, daySlots]) => {
    const hasAllDays = distinctDays.every((day) => daySlots.some((s) => s.dayOfWeek === day));
    const allAvailable = daySlots.every((s) => s.available !== false);

    uniqueTimeSlots.push({
      timeSlot,
      allSlots: daySlots,
      hasAllDays,
      available: allAvailable,
      slotClass: daySlots[0]?.slotClass || 'nonPrime',
    });
  });

  const selectedCount = selectedSlots.length;

  const handleToggleGroup = (slotGroup) => {
    const isAlreadySelected = slotGroup.allSlots.every((s) =>
      selectedSlots.some((sel) => sel.id === s.id)
    );

    if (isAlreadySelected) {
      // Remove all days of this slot
      const idsToRemove = new Set(slotGroup.allSlots.map((s) => s.id));
      onSetSelectedSlots((prev) => prev.filter((s) => !idsToRemove.has(s.id)));
    } else {
      // Select all days of this slot
      onSetSelectedSlots((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const toAdd = slotGroup.allSlots.filter((s) => !existingIds.has(s.id));
        return [...prev, ...toAdd];
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-black text-[#36454F] tracking-tight">Choose your recurring slots</h2>
        <p className="text-slate-500 text-sm font-bold mt-1">
          Select a slot to book it for all days of the week continuously for your membership period.
          {selectedCount > 0 && <span className="text-[#CE2029] ml-2">{(selectedCount / distinctDays.length).toFixed(0)} slot group(s) selected</span>}
        </p>
      </div>

      {/* Start Date Picker inside Step 3 */}
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
          <span className="text-sm font-black text-[#36454F]">{addMonths(startDate, durationOpt.months)}</span>
          <p className="text-[9px] text-slate-400 font-bold mt-0.5">Duration: {durationOpt.label} ({durationOpt.months * 30} days)</p>
        </div>
      </div>

      {err && <p className="text-sm text-red-600 font-bold">{err}</p>}

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-bold">Loading available slots...</div>
      ) : allSlots.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 font-bold">No configured slots for this court.</p>
          <p className="text-slate-300 text-sm font-bold mt-1">Contact the arena to set up court schedules.</p>
        </div>
      ) : uniqueTimeSlots.filter(u => u.hasAllDays).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
          <p className="text-slate-700 font-black">No weekly slots configured</p>
          <p className="text-slate-400 text-xs font-bold mt-1 max-w-md mx-auto">
            This court does not have matching slots configured for all days of the week.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-[#36454F]">Weekly Slots Available</span>
            <span className="text-[10px] font-bold text-slate-400">Select one to book for the entire week</span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uniqueTimeSlots
              .filter((group) => group.hasAllDays)
              .map((group) => {
                const isSelected = group.allSlots.every((s) =>
                  selectedSlots.some((sel) => sel.id === s.id)
                );
                const isAvailable = group.available;

                return (
                  <motion.button
                    key={group.timeSlot}
                    whileHover={isAvailable ? { scale: 1.01 } : {}}
                    whileTap={isAvailable ? { scale: 0.99 } : {}}
                    onClick={() => isAvailable && handleToggleGroup(group)}
                    disabled={!isAvailable}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 text-xs font-black transition-all duration-200 ${
                      !isAvailable
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through'
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
                        <p className={`text-[10px] font-bold mt-0.5 ${!isAvailable ? 'text-slate-300' : isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                          {!isAvailable ? 'Booked on some days' : `Valid for all ${distinctDays.length} days of the week`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.slotClass === 'prime' && (
                        <Crown size={14} className={!isAvailable ? 'text-slate-300' : isSelected ? 'text-amber-300' : 'text-amber-500'} />
                      )}
                      {isSelected && isAvailable && <CheckCircle2 size={16} className="text-white" />}
                      {!isAvailable && (
                        <span className="text-[9px] font-bold text-slate-400 no-underline px-1.5 py-0.5 bg-slate-200/50 rounded ml-1">
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
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#36454F] text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 text-sm font-black whitespace-nowrap"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          {selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected
          <span className="opacity-50">·</span>
          <span className="text-xs font-bold opacity-70">Tap again to deselect</span>
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

  const endDate = addMonths(startDate, durationOpt.months);

  const purchase = async () => {
    setErr('');
    setPurchasing(true);
    try {
      await purchaseSlotMembership({
        arenaId,
        courtId,
        courtSlotIds: selectedSlots.map((s) => s.id),
        durationMonths: durationOpt.months,
        startDate,
        usePoints,
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
        <h2 className="text-2xl font-black text-[#36454F] tracking-tight">Review & confirm</h2>
        <p className="text-slate-500 text-sm font-bold mt-1">Double-check your selection before paying.</p>
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
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              selectedSlots.reduce((acc, s) => {
                if (!acc[s.timeSlot]) acc[s.timeSlot] = [];
                acc[s.timeSlot].push(s.dayOfWeek);
                return acc;
              }, {})
            ).map(([timeSlot, days]) => {
              // Get count of distinct days configured in slot list
              const daysStr = days.length >= 7 ? 'Every Day' : days.join(', ');
              return (
                <span key={timeSlot} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600">
                  <Clock size={11} />{daysStr} · {timeSlot}
                </span>
              );
            })}
          </div>
        </div>
        <div className="p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Start Date</span>
          <p className="text-sm font-black text-[#36454F]">{startDate}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5">Membership ends: {endDate}</p>
        </div>
      </div>

      {/* Wallet & Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CreditCard size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wallet Balance</p>
            <p className="text-lg font-black text-[#36454F]">{formatPrice(wallet?.balance)}</p>
          </div>
        </div>
        {pointsWallet && (
          <button
            onClick={() => setUsePoints((v) => !v)}
            className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
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
        <div className="h-px bg-slate-100" />
        <div className="flex items-center justify-between">
          <span className="font-black text-[#36454F]">Total Due</span>
          <span className="text-2xl font-black text-[#CE2029]">{formatPrice(basePrice)}</span>
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
        className="w-full py-4 bg-[#CE2029] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#b01b22] active:scale-[0.99] transition-all disabled:opacity-50 shadow-xl shadow-[#CE2029]/20"
      >
        {purchasing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock size={16} />
            Confirm & Purchase · {formatPrice(basePrice)}
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
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [startDate, setStartDate] = useState(getTodayStr());
  const [success, setSuccess] = useState(false);

  const canGoNext = () => {
    if (step === 0) return !!durationOpt;
    if (step === 1) return !!selectedArena && !!selectedCourt;
    if (step === 2) return selectedSlots.length > 0;
    return false;
  };

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.some((s) => s.id === slot.id)
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot]
    );
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
            onClick={() => navigate('/profile/slot-memberships')}
            className="w-full py-3.5 bg-[#CE2029] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#b01b22] transition-all"
          >
            View My Memberships
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => step > 0 ? setStep((s) => s - 1) : navigate(-1)}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CE2029]">Slot Membership</p>
            <h1 className="text-base font-black text-[#36454F] tracking-tight leading-none">Purchase Wizard</h1>
          </div>
          <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Step {step + 1} of {STEPS.length}
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
                onToggleSlot={toggleSlot}
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
