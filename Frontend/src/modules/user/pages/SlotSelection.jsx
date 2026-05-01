import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import CourtSlot from '../components/CourtSlot';
import PriceBreakdownCard from '../components/PriceBreakdownCard';
import ArenaProfile from '../../../assets/ArenaProfile.jpeg';
import { isApiConfigured } from '../../../services/config';
import { fetchPublicArenaById } from '../../../services/arenasApi';
import { fetchCourtAvailability, fetchBookingPricing } from '../../../services/bookingsApi';
import { normalizeDetailArena } from '../../../utils/arenaAdapter';
import { toYMDFromDateString } from '../../../utils/bookingDates';
import { isPrimeTimeSlot } from '../../../utils/slotTime';
import { useAuth } from '../context/AuthContext';
import { storage } from '../../../utils/storage';

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
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';
  const navigate = useNavigate();
  const isDark = false;

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
  }, [storedArena, arena, arenaId]);

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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotFilter, setSlotFilter] = useState('all');
  const [apiSlots, setApiSlots] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const useLiveSlots = isApiConfigured() && Boolean(activeCourtId);
  const [serverPricing, setServerPricing] = useState(null);

  useEffect(() => {
    if (useLiveSlots && arenaId && isCustomer) {
      fetchBookingPricing(arenaId)
        .then(res => setServerPricing(res.pricing))
        .catch(console.error);
    }
  }, [useLiveSlots, arenaId, isCustomer]);

  useEffect(() => {
    queueMicrotask(() => setSelectedSlot(null));
  }, [activeCourtId, selectedDate, useLiveSlots]);

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
    /* eslint-disable react-hooks/set-state-in-effect -- show loading before availability fetch */
    setAvailabilityLoading(true);
    setAvailabilityError('');
    /* eslint-enable react-hooks/set-state-in-effect */
    fetchCourtAvailability(activeCourtId, ymd)
      .then((data) => {
        if (cancelled) return;
        const pph = Number(arena?.pricePerHour) || 0;
        const mapped = (data.slots || []).map((s) => ({
          id: s.timeSlot,
          time: s.timeSlot,
          timeSlot: s.timeSlot,
          status: s.available ? 'Available' : 'Booked',
          price: pph,
          type: isPrimeTimeSlot(s.timeSlot) ? 'prime' : 'nonPrime',
        }));
        setApiSlots(mapped);
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
  }, [useLiveSlots, activeCourtId, selectedDate, arena?.pricePerHour]);

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

  const selectedSlotObj = selectedSlot
    ? allDaySlots.find((s) => s.id === selectedSlot)
    : null;
  const priceOverride =
    useLiveSlots && selectedSlotObj ? Number(arena?.pricePerHour) || 0 : null;
  const showApiRate = useLiveSlots && Boolean(selectedSlotObj);

  const heroCardImage =
    arena?.image && typeof arena.image === 'string' && arena.image.startsWith('http')
      ? arena.image
      : ArenaProfile;

  const goToSummary = () => {
    const dateYmd = toYMDFromDateString(selectedDate);
    const slotObj = allDaySlots.find((s) => s.id === selectedSlot);
    navigate('/booking-summary', {
      state: {
        arena,
        court: currentCourt,
        date: selectedDate,
        dateYmd,
        slot: slotObj,
        useApiCheckout: useLiveSlots,
        serverPricing,
      },
    });
  };

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
          const isToday = cell.fullDate.toDateString() === new Date().toDateString();

          return (
            <div key={i} className="flex justify-center">
              <button
                type="button"
                onClick={() => setSelectedDate(cell.fullDate.toDateString())}
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all relative ${
                  isSelected
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

                {useLiveSlots && availabilityError && (
                  <p className="text-[10px] font-bold text-[#CE2029]">{availabilityError}</p>
                )}

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

              {(() => {
                const filteredSlots = allDaySlots.filter((slot) => {
                  if (slotFilter === 'prime') return slot.type === 'prime';
                  if (slotFilter === 'nonPrime') return slot.type === 'nonPrime';
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
                    ) : allDaySlots.length === 0 ? (
                      <div className="col-span-full text-center py-10 text-slate-400">
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          No slots available for this day
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
                          isSelected={selectedSlot === slot.id}
                          onSelect={setSelectedSlot}
                        />
                      ))
                    )}
                  </Motion.div>
                );
              })()}

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

            <div className="space-y-4">
              {selectedSlot ? (
                <PriceBreakdownCard
                  slot={selectedSlotObj}
                  isMember={useLiveSlots ? isCustomer : true}
                  adminOverride={showApiRate ? priceOverride : null}
                  showOverrideBanner={!showApiRate}
                  serverPricing={serverPricing}
                />
              ) : (
                <div className="rounded-[32px] p-10 bg-white border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                    <Star size={32} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 max-w-[200px] leading-relaxed">
                    Select a preferred time slot to review pricing
                  </p>
                </div>
              )}
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={goToSummary}
                className={`w-full py-4 rounded-[22px] font-black uppercase tracking-widest text-xs transition-all duration-500 ${
                  selectedSlot
                    ? 'bg-[#CE2029] text-white shadow-xl hover:-translate-y-1 active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
        <div className="backdrop-blur-xl py-2 px-6 flex items-center justify-between bg-white/90 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] rounded-t-[20px]">
          <PriceBreakdownCard
            slot={selectedSlotObj || null}
            isMember={useLiveSlots ? isCustomer : true}
            adminOverride={showApiRate ? priceOverride : null}
            showOverrideBanner={!showApiRate}
            compact
            serverPricing={serverPricing}
          />
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={goToSummary}
            className={`px-6 py-2.5 rounded-lg font-black uppercase tracking-[0.1em] text-[10px] transition-all ${
              selectedSlot
                ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            Review Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotSelection;
