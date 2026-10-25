import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, CalendarDays, ChevronLeft, ChevronRight, X, CheckCircle2, Layers } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import CourtSlot from '../components/CourtSlot';
import ArenaProfile from '../../../assets/ArenaProfile.jpeg';
import { isApiConfigured } from '../../../services/config';
import { fetchPublicArenaById } from '../../../services/arenasApi';
import { fetchCourtAvailability } from '../../../services/bookingsApi';
import { normalizeDetailArena } from '../../../utils/arenaAdapter';
import { toYMDFromDateString } from '../../../utils/bookingDates';
import { isPrimeTimeSlot, isSlotTimePassed, slotStartHourAndMinute } from '../../../utils/slotTime';
import { useCart, cartItemKey, MAX_CART_ITEMS } from '../context/CartContext';
import CartButton from '../components/CartButton';
import { storage } from '../../../utils/storage';

/** Court availability API response → slot tiles used by this page. */
function mapAvailabilitySlots(data, selectedDate, fallbackPrice) {
  const now = new Date();
  return (data.slots || []).map((s) => {
    const isExpired = isSlotTimePassed(selectedDate, s.timeSlot, now);
    // Use server-computed price (respects peak hours, weekends, etc.)
    const serverPrice = Number(s.price) || Number(fallbackPrice) || 0;
    const isPeak = s.pricing?.type === 'peak';
    return {
      id: s.timeSlot,
      time: s.timeSlot,
      timeSlot: s.timeSlot,
      status: isExpired ? 'Expired' : (s.available ? 'Available' : 'Booked'),
      price: serverPrice,
      pricing: s.pricing || null,   // full pricing object from backend
      isPeak,
      // Prefer the server's authoritative pricing category (peak/prime/standard/service);
      // only fall back to the time-based heuristic when the server doesn't supply one.
      type: s.pricing?.type || (isPrimeTimeSlot(s.timeSlot) ? 'prime' : 'nonPrime'),
    };
  });
}

/** Courts may label the same hour differently ("14:00-15:00" vs "02:00 PM - 03:00 PM"). */
function findSlotAtSameTime(slots, timeSlot) {
  const want = slotStartHourAndMinute(timeSlot);
  if (!want) return null;
  return slots.find((s) => {
    const hm = slotStartHourAndMinute(s.timeSlot);
    return hm && hm.hour === want.hour && hm.minute === want.minute;
  }) || null;
}

// Other courts' availability is re-fetched after this long so "Same time" doesn't offer stale slots.
const COURT_DAY_CACHE_MS = 60 * 1000;

function readStoredArena() {
  try {
    const raw = storage.getItem('selectedArena');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const SlotSelection = () => {
  const { arenaId, courtId } = useParams();
  const storedArena = useMemo(() => readStoredArena(), []);
  const [arenaResolved, setArenaResolved] = useState(null);
  const [arenaLoadError, setArenaLoadError] = useState('');
  const navigate = useNavigate();
  const isDark = false;
  const cart = useCart();
  const [cartNotice, setCartNotice] = useState('');

  useEffect(() => {
    if (!isApiConfigured() || !arenaId) return undefined;
    const stored = readStoredArena();
    if (stored && String(stored.id) === String(arenaId)) {
      queueMicrotask(() => {
        setArenaResolved(stored);
        setArenaLoadError('');
      });
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicArenaById(arenaId);
        if (cancelled) return;
        setArenaResolved(normalizeDetailArena(data));
        setArenaLoadError('');
      } catch (e) {
        if (!cancelled) {
          setArenaResolved(null);
          setArenaLoadError(e.message || 'Arena not found');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [arenaId]);

  const arena = arenaResolved || storedArena || null;

  const arenaCourts = useMemo(() => {
    if (arena?.courts?.length) return arena.courts;
    if (storedArena?.courts?.length) return storedArena.courts;
    return [];
  }, [storedArena, arena]);

  const initialCourtId =
    storedArena?.selectedCourt?.id ?? courtId ?? arenaCourts[0]?.id;
  const [selectedCourt, setSelectedCourt] = useState(() =>
    initialCourtId != null && initialCourtId !== '' ? String(initialCourtId) : ''
  );

  useEffect(() => {
    if (courtId) queueMicrotask(() => setSelectedCourt(String(courtId)));
  }, [courtId]);

  const activeCourtId =
    selectedCourt || (arenaCourts[0] ? String(arenaCourts[0].id) : '');

  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [viewDate, setViewDate] = useState(new Date());
  const [slotFilter, setSlotFilter] = useState('all');
  const [apiSlots, setApiSlots] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilityRetryTick, setAvailabilityRetryTick] = useState(0);

  const useLiveSlots = isApiConfigured() && Boolean(activeCourtId);

  useEffect(() => {
    if (!useLiveSlots) {
      queueMicrotask(() => {
        setApiSlots(null);
        setAvailabilityError('');
      });
      return undefined;
    }
    const ymd = toYMDFromDateString(selectedDate);
    if (!ymd) return undefined;
    let cancelled = false;
     
    setAvailabilityLoading(true);
    setAvailabilityError('');
     
    fetchCourtAvailability(activeCourtId, ymd)
      .then((data) => {
        if (cancelled) return;
        setApiSlots(mapAvailabilitySlots(data, selectedDate, arena?.pricePerHour));
      })
      .catch((e) => {
        if (!cancelled) {
          setApiSlots([]);
          setAvailabilityError(e.message || 'Could not load availability');
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useLiveSlots, activeCourtId, selectedDate, arena?.pricePerHour, availabilityRetryTick]);

  const allDaySlots = useLiveSlots && apiSlots != null ? apiSlots : [];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarDays = (() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthDays = getDaysInMonth(year, month - 1);
    const cells = [];

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      cells.push({
        date: prevMonthDays - i,
        monthOffset: -1,
        fullDate: new Date(year, month - 1, prevMonthDays - i),
      });
    }
    for (let i = 1; i <= daysInMonth; i += 1) {
      cells.push({ date: i, monthOffset: 0, fullDate: new Date(year, month, i) });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i += 1) {
      cells.push({ date: i, monthOffset: 1, fullDate: new Date(year, month + 1, i) });
    }
    return cells;
  })();

  const changeMonth = (offset) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
  };

  const currentCourt = arenaCourts.find((c) => String(c.id) === String(activeCourtId));
  const selectedYmd = toYMDFromDateString(selectedDate);

  // One selection across every court and date. Picking a slot puts it straight into the
  // cart, so switching court or date never loses what was already picked, and everything
  // picked is booked together in one payment (see Cart / courtCheckout).
  const keyFor = (cid, slot) =>
    cartItemKey({ courtId: String(cid), dateYmd: selectedYmd, timeSlot: slot.timeSlot || slot.time });
  const isSlotSelected = (slot) => cart.has({ key: keyFor(activeCourtId, slot) });
  const selectedItems = cart.items;
  const hasSelection = selectedItems.length > 0;
  const selectedTotal = cart.total;
  const selectedCourtCount = new Set(selectedItems.map((i) => `${i.arenaId}|${i.courtId}`)).size;
  const selectedCountForCourt = (cid) =>
    selectedItems.filter((i) => String(i.courtId) === String(cid) && i.dateYmd === selectedYmd).length;
  const formatShortDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const buildCartItem = (court, slot) => ({
    arenaId: String(arena.id),
    arenaName: arena.name,
    arenaImage: arena.image,
    arenaLocation: arena.location,
    courtId: String(court.id),
    courtName: court.name,
    courtType: court.type,
    date: selectedDate,
    dateYmd: selectedYmd,
    timeSlot: slot.timeSlot || slot.time,
    price: Number(slot.price) || 0,
    pricing: slot.pricing || null,
  });
  const addToSelection = (entries) => {
    const added = cart.addItems(entries.map(({ court, slot }) => buildCartItem(court, slot)));
    if (!added) {
      setCartNotice(cart.isFull ? `You can book up to ${MAX_CART_ITEMS} slots at once` : 'This slot can no longer be selected');
    }
    return added;
  };

  // "Same time on other courts": after a slot is picked, offer that hour on every other court.
  const [sameTime, setSameTime] = useState(null); // { ymd, timeSlot }
  const [courtDayCache, setCourtDayCache] = useState({}); // `${courtId}|${ymd}` → { status, slots, at }
  const sameTimeSlot = sameTime && sameTime.ymd === selectedYmd ? sameTime.timeSlot : null;

  const toggleSlot = (slotId) => {
    const slot = allDaySlots.find((x) => x.id === slotId);
    if (!slot || slot.status !== 'Available' || !currentCourt || !arena) return;
    const key = keyFor(currentCourt.id, slot);
    if (cart.has({ key })) {
      cart.removeItem(key);
      return;
    }
    if (addToSelection([{ court: currentCourt, slot }]) && arenaCourts.length > 1) {
      setSameTime({ ymd: selectedYmd, timeSlot: slot.timeSlot || slot.time });
    }
  };

  useEffect(() => {
    if (!sameTimeSlot || !selectedYmd || !isApiConfigured()) return;
    const now = Date.now();
    const stale = arenaCourts.filter((c) => {
      const entry = courtDayCache[`${c.id}|${selectedYmd}`];
      return !entry || (entry.status !== 'loading' && now - entry.at > COURT_DAY_CACHE_MS);
    });
    if (stale.length === 0) return;
    setCourtDayCache((prev) => {
      const next = { ...prev };
      stale.forEach((c) => { next[`${c.id}|${selectedYmd}`] = { status: 'loading', slots: [], at: now }; });
      return next;
    });
    stale.forEach((c) => {
      const cacheKey = `${c.id}|${selectedYmd}`;
      fetchCourtAvailability(c.id, selectedYmd)
        .then((data) => ({ status: 'ok', slots: mapAvailabilitySlots(data, selectedDate, arena?.pricePerHour) }))
        .catch(() => ({ status: 'error', slots: [] }))
        .then((entry) => setCourtDayCache((prev) => ({ ...prev, [cacheKey]: { ...entry, at: Date.now() } })));
    });
  }, [sameTime, sameTimeSlot, selectedYmd, selectedDate, arenaCourts, courtDayCache, arena?.pricePerHour]);

  // One row per other court for the "Same time" panel.
  const sameTimeOptions = sameTimeSlot
    ? arenaCourts
      .filter((c) => String(c.id) !== String(activeCourtId))
      .map((court) => {
        const entry = courtDayCache[`${court.id}|${selectedYmd}`];
        if (!entry || entry.status === 'loading') return { court, state: 'loading' };
        if (entry.status === 'error') return { court, state: 'error' };
        const slot = findSlotAtSameTime(entry.slots, sameTimeSlot);
        if (!slot) return { court, state: 'none' };
        if (cart.has({ key: keyFor(court.id, slot) })) return { court, slot, state: 'selected' };
        if (slot.status !== 'Available') return { court, slot, state: 'booked' };
        return { court, slot, state: 'available' };
      })
    : [];
  const sameTimeAvailable = sameTimeOptions.filter((o) => o.state === 'available');
  const toggleSameTime = (opt) => {
    if (opt.state === 'selected') cart.removeItem(keyFor(opt.court.id, opt.slot));
    else if (opt.state === 'available') addToSelection([opt]);
  };

  const switchCourt = (id) => {
    if (String(id) === String(activeCourtId)) return;
    setSelectedCourt(String(id));
    navigate(`/book/${arenaId}/${id}`, { replace: true });
  };

  useEffect(() => {
    if (!cartNotice) return undefined;
    const t = setTimeout(() => setCartNotice(''), 3500);
    return () => clearTimeout(t);
  }, [cartNotice]);

  // Review & pay for everything selected (any courts, any dates) — the cart page re-checks
  // availability, applies member discount / coupon / wallet, and takes one payment.
  const goToCheckout = () => {
    if (!hasSelection) return;
    navigate('/cart');
  };

  const selectionList = (
    <div className="space-y-1.5">
      {selectedItems.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#CE2029]/5 border border-[#CE2029]/15">
          <div className="min-w-0">
            <p className="text-[11px] font-black text-slate-900 truncate">
              {item.courtName}{item.arenaId !== String(arena?.id) ? ` · ${item.arenaName}` : ''}
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              {formatShortDate(item.date)} · {item.timeSlot}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black text-slate-900">OMR {(Number(item.price) || 0).toFixed(3)}</span>
            <button
              type="button"
              onClick={() => cart.removeItem(item.key)}
              aria-label={`Remove ${item.courtName} ${item.timeSlot}`}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#CE2029] hover:bg-white"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const heroCardImage =
    arena?.image && typeof arena.image === 'string' && arena.image.startsWith('http')
      ? arena.image
      : ArenaProfile;

  const renderCalendarGrid = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {calendarDays.map((cell, i) => {
          const isSelected = selectedDate === cell.fullDate.toDateString();
          const isCurrentMonth = cell.monthOffset === 0;
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const cellTime = new Date(cell.fullDate.getFullYear(), cell.fullDate.getMonth(), cell.fullDate.getDate()).getTime();
          const isPastDate = cellTime < todayStart;
          const isToday = cellTime === todayStart;

          return (
            <div key={i} className="flex justify-center">
              <button
                type="button"
                disabled={isPastDate}
                onClick={() => !isPastDate && setSelectedDate(cell.fullDate.toDateString())}
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all relative ${
                  isPastDate
                    ? 'opacity-30 text-slate-300 cursor-not-allowed pointer-events-none'
                    : isSelected
                      ? 'bg-[#CE2029] text-white shadow-lg scale-110 z-10'
                      : isCurrentMonth
                        ? 'text-slate-700 hover:bg-[#CE2029]/5'
                        : 'text-slate-200'
                }`}
              >
                {cell.date}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#CE2029]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isApiConfigured() && arenaLoadError && !arena) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 text-center text-sm font-bold text-[#CE2029]">
        {arenaLoadError}
      </div>
    );
  }

  if (!arena) {
    if (!isApiConfigured()) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 text-sm text-slate-600 text-center max-w-md mx-auto">
          Set <span className="font-mono">VITE_API_URL</span> and open this page from an arena so slot availability can load from the server.
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 relative overflow-hidden bg-slate-50">
      <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#CE2029]/5 to-transparent pointer-events-none" />
      <div className="hidden lg:block absolute top-1/4 -right-20 w-80 h-80 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 -left-20 w-80 h-80 bg-[#CE2029]/5 rounded-full blur-[100px] pointer-events-none" />

      {!isDark && (
        <div className="lg:hidden">
          <div className="absolute top-24 -right-20 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[500px] -left-20 w-64 h-64 bg-[#CE2029]/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      <div className="px-6 pt-3 md:pt-4 pb-3 md:pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all bg-[#CE2029] border-white/10 rounded-b-[20px] md:rounded-none shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all bg-white/10 border-white/20 text-white shadow-sm hover:bg-white/20"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider font-display">
            Select Time Slot
          </h1>
          <CartButton className="ml-auto" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-4 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-x-12 lg:gap-y-8 items-start">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <div className="group relative overflow-hidden rounded-[32px] border transition-all duration-500 bg-white border-blue-50/50 shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#CE2029]/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="p-8 flex flex-col items-center text-center relative z-10">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-slate-100 flex items-center justify-center text-[#CE2029] shadow-xl border-4 border-white overflow-hidden shrink-0 mb-6">
                  <img
                    src={heroCardImage}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt=""
                  />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border border-amber-100">
                    <Star size={10} fill="currentColor" /> {arena.rating ?? '—'}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    • {arena.reviewsCount ?? arena.reviews ?? 0} Reviews
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1 uppercase font-display">
                  {arena.name}
                </h2>

                <p className="text-slate-500 font-bold text-[10px] flex items-center gap-1 mb-4 uppercase tracking-tight">
                  <MapPin size={12} className="text-[#CE2029]" /> {arena.location}
                </p>

                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-[#CE2029]/5 text-[#CE2029] text-[8px] font-black uppercase tracking-widest border border-[#CE2029]/10">
                    {currentCourt?.name}
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-3 mt-5">
                  {[
                    { icon: Star, label: 'Pro Grade' },
                    { icon: CalendarDays, label: 'Instant' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg"
                    >
                      <item.icon size={10} className="text-[#CE2029]/60" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="bg-white rounded-[32px] p-6 border border-blue-50/50 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60">
                      Select Date
                    </h3>
                    <h3 className="text-xl font-black text-slate-900 leading-none mt-1">
                      {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                {renderCalendarGrid()}
              </div>
            </div>

            <div className="px-6 py-8 md:py-8 md:px-8 rounded-[36px] border transition-all duration-500 bg-white border-blue-50 shadow-[0_12px_40px_rgba(10,31,68,0.05)]">
              {arenaCourts.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60 mb-2">
                    Court
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-1.5 -mx-1 px-1">
                    {arenaCourts.map((c) => {
                      const active = String(c.id) === String(activeCourtId);
                      const picked = selectedCountForCourt(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => switchCourt(c.id)}
                          className={`relative shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            active
                              ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-md'
                              : picked
                                ? 'bg-[#CE2029]/5 border-[#CE2029]/40 text-[#CE2029]'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-[#CE2029]/40'
                          }`}
                        >
                          {c.name}
                          {picked > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white ${active ? 'bg-slate-900 text-white' : 'bg-[#CE2029] text-white'}`}>
                              {picked}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-start gap-1.5">
                    <Layers size={12} className="text-[#CE2029] shrink-0 mt-0.5" />
                    <span>Booking more than one court? Tap a time, then tick the other courts under &ldquo;Same time on other courts&rdquo; — everything you pick is booked together.</span>
                  </p>
                </div>
              )}
              <div className="mb-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60 mb-1">
                      Available Slots
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" /> Available
                  </div>
                </div>

                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All Slots', icon: null },
                    { key: 'prime', label: 'Prime', icon: Star },
                    { key: 'nonPrime', label: 'Standard', icon: CalendarDays },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setSlotFilter(f.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                        slotFilter === f.key
                          ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-md'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {f.icon && (
                        <f.icon
                          size={9}
                          fill={slotFilter === f.key && f.key === 'prime' ? 'currentColor' : 'none'}
                        />
                      )}
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Everything picked so far, across courts and dates (phones — desktop shows it in the sidebar) */}
              <AnimatePresence>
                {hasSelection && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden lg:hidden"
                  >
                    <div className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Your selection · {selectedItems.length} slot{selectedItems.length === 1 ? '' : 's'}
                        </p>
                        <button type="button" onClick={() => cart.clearCart()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#CE2029]">
                          Clear
                        </button>
                      </div>
                      {selectionList}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {(() => {
                const filteredSlots = allDaySlots.filter((slot) => {
                  if (slotFilter === 'prime') return slot.type === 'prime' || slot.type === 'peak';
                  if (slotFilter === 'nonPrime') return slot.type !== 'prime' && slot.type !== 'peak';
                  return true;
                });
                return (
                  <Motion.div
                    key={selectedDate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1.5"
                  >
                    {availabilityLoading && useLiveSlots ? (
                      <div className="col-span-full text-center py-10 text-slate-400">
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading availability…</p>
                      </div>
                    ) : useLiveSlots && availabilityError && allDaySlots.length === 0 ? (
                      <div className="col-span-full text-center py-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] mb-3">
                          Couldn't load slots — {availabilityError}
                        </p>
                        <button
                          type="button"
                          onClick={() => setAvailabilityRetryTick((t) => t + 1)}
                          className="px-4 py-2 rounded-xl bg-[#CE2029] text-white text-[9px] font-black uppercase tracking-widest"
                        >
                          Retry
                        </button>
                      </div>
                    ) : allDaySlots.length === 0 ? (
                      <div className="col-span-full text-center py-10 text-slate-400">
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          No slots available for this day
                        </p>
                      </div>
                    ) : allDaySlots.length > 0 && allDaySlots.every(s => s.status !== 'Available') && new Date(selectedDate).toDateString() === new Date().toDateString() ? (
                      <div className="col-span-full text-center py-10 text-[#CE2029]">
                        <p className="text-[11px] font-black uppercase tracking-widest">
                          No slots are available for the remainder of today.
                        </p>
                      </div>
                    ) : filteredSlots.length === 0 ? (
                      <div className="col-span-full text-center py-10 text-slate-400">
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          No slots in this category
                        </p>
                      </div>
                    ) : (
                      filteredSlots.map((slot) => (
                        <CourtSlot
                          key={slot.id}
                          slot={slot}
                          isSelected={slot.status === 'Available' && isSlotSelected(slot)}
                          onSelect={toggleSlot}
                        />
                      ))
                    )}
                  </Motion.div>
                );
              })()}

              <AnimatePresence>
                {sameTimeOptions.length > 0 && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 p-4 rounded-2xl border border-[#CE2029]/20 bg-[#CE2029]/[0.03]" data-testid="same-time-panel">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#CE2029] flex items-center gap-1.5">
                            <Layers size={13} className="shrink-0" /> Same time on other courts
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {formatShortDate(selectedDate)} · {sameTimeSlot}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSameTime(null)}
                          aria-label="Hide same time on other courts"
                          className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#CE2029] hover:bg-white"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {sameTimeOptions.map((opt) => {
                          const selected = opt.state === 'selected';
                          const enabled = selected || opt.state === 'available';
                          const note = {
                            loading: 'Checking…',
                            error: 'Couldn’t check',
                            none: 'Not offered',
                            booked: opt.slot?.status === 'Expired' ? 'Time passed' : 'Booked',
                          }[opt.state];
                          return (
                            <button
                              key={opt.court.id}
                              type="button"
                              disabled={!enabled}
                              onClick={() => toggleSameTime(opt)}
                              aria-pressed={selected}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                selected
                                  ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-md'
                                  : enabled
                                    ? 'bg-white border-slate-200 text-slate-800 hover:border-[#CE2029]/50 active:scale-95'
                                    : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <span className={`w-4 h-4 shrink-0 rounded-md border-2 flex items-center justify-center ${selected ? 'bg-white border-white text-[#CE2029]' : enabled ? 'border-slate-300' : 'border-slate-200'}`}>
                                {selected && <CheckCircle2 size={12} strokeWidth={3} />}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[11px] font-black uppercase tracking-wide truncate">{opt.court.name}</span>
                                <span className={`block text-[10px] font-bold ${selected ? 'text-white/80' : enabled ? 'text-slate-500' : 'text-slate-300'}`}>
                                  {note || `OMR ${(Number(opt.slot.price) || 0).toFixed(3)}`}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {sameTimeAvailable.length > 1 && (
                        <button
                          type="button"
                          onClick={() => addToSelection(sameTimeAvailable)}
                          className="mt-3 w-full py-2.5 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95"
                        >
                          Select all {sameTimeAvailable.length} courts
                        </button>
                      )}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-4 border-t border-slate-50 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#CE2029] shadow-sm" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Prime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Service</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="hidden lg:block bg-white rounded-[32px] p-6 border border-blue-50/50 shadow-sm h-fit">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60">Select Date</h3>
                  <h3 className="text-xl font-black text-slate-900 leading-none mt-1">
                    {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#CE2029] transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#CE2029] transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              {renderCalendarGrid()}
            </div>

            <div className="hidden lg:flex items-center justify-between p-5 bg-[#CE2029]/5 rounded-[32px] border border-[#CE2029]/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#CE2029] shadow-sm">
                  <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-[#CE2029]">Member Perks</h5>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Membership discounts apply at checkout on the server.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop only — phones show the selection above the slots and the Book bar at the bottom */}
            <div className="hidden lg:block space-y-4">
              {hasSelection ? (
                <div className="rounded-[32px] p-6 bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#CE2029]/70">Your Selection</h4>
                    <button type="button" onClick={() => cart.clearCart()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#CE2029]">
                      Clear
                    </button>
                  </div>
                  {selectionList}
                  <div className="flex items-end justify-between pt-4 mt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {selectedItems.length} slot{selectedItems.length === 1 ? '' : 's'} · {selectedCourtCount} court{selectedCourtCount === 1 ? '' : 's'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400">Member discount & coupons applied at checkout</p>
                    </div>
                    <span className="text-xl font-black font-display text-slate-900">OMR {selectedTotal.toFixed(3)}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-[32px] p-10 bg-white border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                    <Star size={32} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 max-w-[220px] leading-relaxed">
                    Tap any available slot to select it
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-1">
                    Switch court to add more courts
                  </p>
                </div>
              )}
              <button
                type="button"
                disabled={!hasSelection}
                onClick={goToCheckout}
                className={`w-full py-4 rounded-[22px] font-black uppercase tracking-widest text-xs transition-all duration-500 ${
                  hasSelection
                    ? 'bg-[#CE2029] text-white shadow-xl hover:-translate-y-1 active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {hasSelection
                  ? `Book ${selectedItems.length} Slot${selectedItems.length === 1 ? '' : 's'}`
                  : 'Select a Slot'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
        <div className="backdrop-blur-xl pt-3 pb-[calc(0.75rem+var(--safe-bottom))] px-5 flex items-center justify-between gap-3 bg-white/95 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] rounded-t-[20px]">
          <div className="min-w-0">
            {hasSelection ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {selectedItems.length} slot{selectedItems.length === 1 ? '' : 's'} · {selectedCourtCount} court{selectedCourtCount === 1 ? '' : 's'}
                </p>
                <p className="text-lg font-black text-slate-900 leading-tight">OMR {selectedTotal.toFixed(3)}</p>
              </>
            ) : (
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-snug">
                Tap slots to select<br />
                <span className="text-slate-300">switch court to add more</span>
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={!hasSelection}
            onClick={goToCheckout}
            className={`shrink-0 px-6 py-3 rounded-xl font-black uppercase tracking-[0.1em] text-[11px] transition-all active:scale-95 ${
              hasSelection
                ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            {hasSelection ? `Book ${selectedItems.length} Slot${selectedItems.length === 1 ? '' : 's'}` : 'Book'}
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-24 lg:bottom-8 z-[70] flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {cartNotice && (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-sm pointer-events-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold flex-1">{cartNotice}</span>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default SlotSelection;
