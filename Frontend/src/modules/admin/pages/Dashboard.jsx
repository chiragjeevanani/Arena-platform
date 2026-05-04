import { useState, useEffect } from 'react';
import { 
  PoundSterling, CalendarDays,
  ChevronLeft, ChevronRight,
  Receipt, WalletCards, Users, Zap
} from 'lucide-react';
import { listAdminArenas, getAdminArenaById, listAdminPosSales } from '../../../services/adminOpsApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { useAuth } from '../../user/context/AuthContext';
import { getAdminReportSummary } from '../../../services/adminReportsApi';
import { listAdminBookings } from '../../../services/adminBookingsApi';
import { listAdminArenaSlots } from '../../../services/adminSlotApi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [arenas, setArenas] = useState([]);
  const [selectedArenaId, setSelectedArenaId] = useState('');
  const [arenaDetails, setArenaDetails] = useState(null);
  const [arenaSlots, setArenaSlots] = useState([]);
  const [calendarView, setCalendarView] = useState('Week');
  const [summary, setSummary] = useState(null);
  const [scheduleBookings, setScheduleBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadError, setLoadError] = useState('');
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('all');

  // Default Date Range (Current Month)
  const [startDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate] = useState(() => {
    const d = new Date();
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  });

  // Initial Arena Load
  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) return;
    (async () => {
      try {
        if (user?.role === 'ARENA_ADMIN' && user?.assignedArena) {
          setSelectedArenaId(user.assignedArena);
        } else if (user?.role === 'SUPER_ADMIN') {
          const res = await listAdminArenas();
          const rawList = res.arenas || [];
          
          // Deduplicate by name (case-insensitive)
          const uniqueMap = new Map();
          rawList.forEach(a => {
            const normalizedName = a.name.trim().toLowerCase();
            if (!uniqueMap.has(normalizedName)) {
              uniqueMap.set(normalizedName, a);
            }
          });
          
          const list = Array.from(uniqueMap.values());
          setArenas(list);
          if (list.length > 0 && !selectedArenaId) {
            setSelectedArenaId(list[0].id);
          }
        }
      } catch (e) {
        setLoadError('Failed to fetch arenas');
      }
    })();
  }, [user]);

  // Data Fetching based on selectedArenaId
  useEffect(() => {
    if (!selectedArenaId) {
      if (user) setIsLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError('');
      
      // Independent data fetching to prevent one failure from killing the dashboard
      const fetchSection = async (fn, setter, transform = (d) => d) => {
        try {
          const res = await fn();
          if (!cancelled) setter(transform(res));
        } catch (e) {
          console.error('Section fetch failed:', e);
        }
      };

      try {
        // 1. Load Arena Details & Courts first (critical for other data)
        const arenaInfo = await getAdminArenaById(selectedArenaId);
        if (cancelled) return;
        
        const courtsList = (arenaInfo.courts || []).map(c => ({ id: c.id, name: c.name }));
        setCourts(courtsList);
        setArenaDetails(arenaInfo.arena);
        const validCourtIds = courtsList.map(c => c.id);

        // 2. Load other sections independently
        await Promise.all([
          fetchSection(() => getAdminReportSummary({ arenaId: selectedArenaId, from: startDate, to: endDate }), setSummary),
          
          fetchSection(() => listAdminBookings({ arenaId: selectedArenaId, from: startDate, to: endDate }), (data) => {
            const bks = data.bookings || [];
            const filteredBks = selectedCourtId === 'all' 
              ? bks 
              : bks.filter(b => String(b.courtId) === selectedCourtId);
            
            setRecentBookings(
              filteredBks.slice(0, 8).map((b) => ({
                date: b.date || '—',
                court: b.courtName || '—',
                time: b.timeSlot || '—',
                player: b.userName || `User …${String(b.userId || '').slice(-6)}`,
                phone: b.userPhone || '',
                status: b.status || '—',
                statusBg: b.status === 'confirmed' ? '#d1fae5' : '#f1f5f9',
                statusText: b.status === 'confirmed' ? '#047857' : '#64748b',
              }))
            );

            const bookingPayments = bks
              .filter(b => b.paymentStatus === 'paid')
              .map(b => ({
                player: b.userName || `User …${String(b.userId || '').slice(-6)}`,
                phone: b.userPhone || '',
                amount: Number(b.amount || 0),
                method: b.paymentMethod || 'Online',
                date: new Date(b.createdAt || b.updatedAt || Date.now()),
                status: 'Paid',
                statusBg: '#d1fae5',
                statusText: '#047857',
              }));
            setPaymentList(prev => [...prev, ...bookingPayments].sort((a, b) => b.date - a.date).slice(0, 5));
            
            return bks; 
          }),

          fetchSection(() => listAdminPosSales(selectedArenaId), (data) => {
            const posPayments = (data.sales || []).map(s => ({
              player: s.customer?.name || `POS ${String(s.id || '').slice(-6)}`,
              phone: s.customer?.phone || '',
              amount: Number(s.totalAmount || 0),
              method: s.paymentMethod || 'POS',
              date: new Date(s.createdAt || Date.now()),
              status: 'Paid',
              statusBg: '#d1fae5',
              statusText: '#047857',
            }));
            setPaymentList(prev => [...prev, ...posPayments].sort((a, b) => b.date - a.date).slice(0, 5));
            return data;
          }),

          fetchSection(() => listAdminArenaSlots(selectedArenaId), (data) => {
            const rawSlots = data.slots || [];
            let allSlots = validCourtIds.length > 0 
              ? rawSlots.filter(s => validCourtIds.includes(String(s.courtId)))
              : rawSlots;
            if (selectedCourtId !== 'all') {
              allSlots = allSlots.filter(s => String(s.courtId) === selectedCourtId);
            }
            setArenaSlots(allSlots);
            return allSlots;
          })
        ]);

        // 3. Post-load calculation for the schedule grid
        // (Simplified for now, can be refined based on state dependencies)
        
      } catch (e) {
        if (!cancelled) setLoadError('Critical: Could not load arena details.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedArenaId, user, currentDate, selectedCourtId]);

  // Formatter for slot labels (e.g., 15:00-16:00 -> 03:00 PM - 04:00 PM)
  const formatSlotLabel = (slotStr) => {
    if (!slotStr) return '—';
    if (!slotStr.includes('-')) return slotStr;
    
    const parts = slotStr.split('-').map(p => p.trim());
    const formatTime = (t) => {
      if (t.includes('AM') || t.includes('PM')) return t;
      // Handle 24h format like 15:00
      const [h, m] = t.split(':').map(Number);
      if (isNaN(h)) return t;
      const period = h >= 12 ? 'PM' : 'AM';
      const hours = h % 12 || 12;
      return `${String(hours).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${period}`;
    };

    return `${formatTime(parts[0])} - ${formatTime(parts[1])}`;
  };

  // Helper for consistent date strings (YYYY-MM-DD)
  const formatDateKey = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Dynamic week calculation
  const getWeekDates = (baseDate) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(new Date(d).setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        fullDate: formatDateKey(date),
        isToday: date.toDateString() === new Date().toDateString()
      };
    });
  };

  const weekDates = getWeekDates(currentDate);

  const handleDayClick = (dayNum) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    setCurrentDate(newDate);
    setCalendarView('Week');
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const displayTimeSlots = [...new Set(arenaSlots.map(s => s.timeSlot))].sort((a, b) => {
    const aTime = a.split('-')[0].trim();
    const bTime = b.split('-')[0].trim();
    return new Date(`1970/01/01 ${aTime}`) - new Date(`1970/01/01 ${bTime}`);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-bold">
        Loading Realtime Dashboard...
      </div>
    );
  }

  return (
    <div className="bg-[#F4F7F6] min-h-full p-4 md:p-6 lg:p-8 font-sans">
      {loadError ? (
        <div className="max-w-[1600px] mx-auto mb-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-bold px-4 py-3">
          {loadError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-8 flex flex-col gap-5 lg:gap-6">
          
          {/* Bookings Overview Schedule Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
            <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-[#36454F]">Bookings Overview</h2>
                {user?.role === 'SUPER_ADMIN' && arenas.length > 0 && (
                  <select 
                    value={selectedArenaId}
                    onChange={(e) => setSelectedArenaId(e.target.value)}
                    className="text-xs font-bold text-[#CE2029] bg-transparent border-none focus:ring-0 p-0 cursor-pointer hover:underline"
                  >
                    {arenas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
                
                {courts.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Court:</span>
                    <select 
                      value={selectedCourtId}
                      onChange={(e) => setSelectedCourtId(e.target.value)}
                      className="text-[11px] font-black text-[#36454F] bg-[#F8F9FA] border border-slate-200 rounded px-2 py-0.5 focus:ring-1 focus:ring-[#CE2029]/30 outline-none cursor-pointer hover:border-slate-300 transition-all"
                    >
                      <option value="all">All Courts</option>
                      {courts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button 
                  onClick={() => setCalendarView('Day')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${calendarView === 'Day' ? 'text-[#CE2029] bg-white shadow-sm ring-1 ring-slate-200' : 'text-[#36454F] hover:bg-slate-50'}`}
                >Day</button>
                <button 
                  onClick={() => setCalendarView('Week')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${calendarView === 'Week' ? 'text-[#CE2029] bg-white shadow-sm ring-1 ring-slate-200' : 'text-[#36454F] hover:bg-slate-50'}`}
                >Week</button>
                <button 
                  onClick={() => setCalendarView('Month')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${calendarView === 'Month' ? 'text-[#CE2029] bg-white shadow-sm ring-1 ring-slate-200' : 'text-[#36454F] hover:bg-slate-50'}`}
                >Month</button>
              </div>
            </div>

            <div className="p-3 md:p-4 pb-6">
              {calendarView === 'Day' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 w-full max-w-lg mx-auto">
                      <button onClick={() => navigateDay(-1)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"><ChevronLeft size={18} /></button>
                      <div className="flex-1 text-center font-black text-[#36454F] tracking-tight">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <button onClick={() => navigateDay(1)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                  <div className="border border-slate-100 rounded-lg bg-white overflow-hidden relative max-h-[500px] overflow-y-auto">
                    <div className="grid divide-y divide-slate-100 w-full relative">
                      {displayTimeSlots.map((time, idx) => {
                        const curDateKey = formatDateKey(currentDate);
                        const dayBooking = scheduleBookings.find(b => b.time === time && b.fullDate === curDateKey);
                        
                        return (
                          <div key={idx} className="flex min-h-[60px] group">
                            <div className="w-[120px] shrink-0 flex items-center justify-center text-[10px] font-black text-slate-400 border-r border-slate-100 bg-slate-50/30 uppercase">
                              {formatSlotLabel(time)}
                            </div>
                            <div className="flex-1 p-2 relative">
                              {dayBooking ? (
                                <div className="h-full rounded-lg p-3 flex flex-col justify-center border-l-4 shadow-sm" style={{ backgroundColor: `${dayBooking.bgColor}15`, borderLeftColor: dayBooking.bgColor }}>
                                  <p className="text-xs font-black text-[#36454F]">{dayBooking.name}</p>
                                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{dayBooking.time}</p>
                                </div>
                              ) : (
                                <div className="h-full w-full rounded-lg border border-dashed border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Available</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {displayTimeSlots.length === 0 && (
                        <div className="p-20 text-center text-slate-400 italic text-sm">No slots for this day.</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {calendarView === 'Week' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 w-full max-w-2xl mx-auto">
                      <button 
                        onClick={() => navigateWeek(-1)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div className="flex-1 text-center font-black text-[#36454F] tracking-tight">
                        {new Date(weekDates[0].fullDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <button 
                        onClick={() => navigateWeek(1)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-lg overflow-x-auto relative min-w-full bg-slate-50/30 max-h-[550px] overflow-y-auto">
                    
                    <div className="sticky top-0 z-30 flex min-w-[800px] bg-white border-b border-slate-100 shadow-sm">
                      <div className="w-[120px] shrink-0 border-r border-slate-100 flex items-center justify-center bg-slate-50/50">
                        <CalendarDays size={14} className="text-slate-400" />
                      </div>
                      <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100">
                        {weekDates.map((wd, i) => (
                          <div key={i} className="py-3 text-center">
                            <span className={`text-[11px] font-black px-2 py-1 rounded-md transition-colors ${wd.isToday ? 'text-[#CE2029] bg-[#CE2029]/10' : 'text-[#36454F]'}`}>
                              {wd.dayName} {wd.dayNumber}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative min-w-[800px]">
                      <div 
                        className="grid divide-y divide-slate-100 border-b border-slate-100 w-full"
                        style={{ 
                          gridTemplateRows: `repeat(${displayTimeSlots.length}, minmax(50px, auto))`
                        }}
                      >
                        {displayTimeSlots.map((time, idx) => (
                          <div key={idx} className="flex flex-row">
                            <div className="w-[120px] shrink-0 flex items-start pt-3 px-3 text-[9px] font-black text-slate-400 border-r border-slate-100 bg-white/80 backdrop-blur-[2px] min-h-[50px] uppercase tracking-tighter">
                              {formatSlotLabel(time)}
                            </div>
                            <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100">
                              {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="bg-transparent border-slate-50/50" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div 
                        className="absolute inset-y-0 left-[120px] right-0 grid grid-cols-7 p-2 gap-x-2 gap-y-1 pointer-events-none"
                        style={{ 
                          gridTemplateRows: `repeat(${displayTimeSlots.length * 2}, 1fr)` 
                        }}
                      >
                        {scheduleBookings.map((bk, i) => (
                          <div 
                            key={i} 
                            className="rounded-md p-2 shadow-sm font-bold flex flex-col justify-center border border-black/5 hover:scale-[1.01] transition-transform cursor-pointer overflow-hidden pointer-events-auto"
                            style={{ 
                              backgroundColor: bk.bgColor,
                              color: bk.textColor,
                              gridColumnStart: bk.colStart, 
                              gridRowStart: (bk.rowStart * 2) - 1, 
                              gridRowEnd: `span 2` 
                            }}
                          >
                            <p className="text-[10px] font-black leading-tight truncate">{bk.name}</p>
                            <p className="text-[8px] font-bold opacity-90 truncate leading-tight mt-0.5">{bk.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {calendarView === 'Month' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => navigateMonth(-1)}
                      className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft size={16} /> 
                      {new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).toLocaleDateString('en-US', { month: 'short' })}
                    </button>
                    <h3 className="text-[#36454F] font-black text-xl tracking-tight">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button 
                      onClick={() => navigateMonth(1)}
                      className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1).toLocaleDateString('en-US', { month: 'short' })}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="border border-slate-100 rounded-lg bg-white overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-[#F8F9FA]">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={i} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-r border-slate-100 last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {Array.from({ length: 35 }).map((_, i) => {
                        const monthStartDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                        const dayNumber = i - monthStartDay + 1;
                        const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                        const isCurrentMonth = dayNumber > 0 && dayNumber <= totalDays;
                        
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                        const count = bookingCounts[dateStr] || 0;
                        const isToday = dayNumber === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                        
                        return (
                          <div 
                            key={i} 
                            onClick={() => isCurrentMonth && handleDayClick(dayNumber)}
                            className={`border-r border-b border-slate-100 last:border-r-0 p-1 min-h-[60px] md:min-h-[80px] transition-all cursor-pointer ${isCurrentMonth ? 'bg-white hover:bg-slate-50/80 active:bg-slate-100' : 'bg-slate-50/50 text-slate-300 pointer-events-none'}`}
                          >
                            {isCurrentMonth && (
                              <div className="flex flex-col h-full items-center justify-between py-1">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black transition-all ${isToday ? 'bg-[#CE2029] text-white shadow-md scale-110' : 'text-[#36454F]'}`}>
                                  {dayNumber}
                                </span>
                                {count > 0 && (
                                  <div className="bg-[#CE2029]/10 text-[#CE2029] text-[9px] font-black px-2 py-0.5 rounded-full mt-1 animate-pulse border border-[#CE2029]/20">
                                    {count} {count === 1 ? 'Booking' : 'Bookings'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
            <div className="p-3 md:p-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarDays className="text-[#CE2029]" size={20} />
              <h3 className="text-lg font-bold text-[#36454F]">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8F9FA] text-[#36454F] font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Court</th>
                    <th className="px-6 py-4 flex items-center gap-1">Time <ChevronRight size={12} className="rotate-90"/></th>
                    <th className="px-6 py-4">Player Name</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentBookings.map((bk, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">{bk.date}</td>
                      <td className="px-6 py-4 text-slate-700">{bk.court}</td>
                      <td className="px-6 py-4 text-slate-700">{bk.time}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#36454F] leading-tight">{bk.player}</p>
                        {bk.phone && <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">{bk.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: bk.statusBg, color: bk.statusText }}>
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No recent bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-5 lg:gap-6">
          <div className="bg-[#F4F7F6] ring-1 ring-slate-200/50 rounded-xl overflow-hidden shadow-sm flex flex-col gap-[2px] transition-all hover:ring-[#CE2029]/40">
            <div className="bg-[#36454F] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#CE2029] flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mb-0.5">Total Revenue</p>
                  <p className="text-xs text-white/50 font-medium">All channels combined</p>
                </div>
              </div>
              <p className="text-2xl font-black tracking-tight">
                OMR {(
                  Number(summary?.bookings?.revenueAmount || 0) + 
                  Number(summary?.pos?.totalAmount || 0) + 
                  Number(summary?.membership?.totalRevenue || 0) + 
                  Number(summary?.coaching?.totalRevenue || 0)
                ).toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029] shrink-0">
                   <div className="text-[10px] font-black">POS</div>
                </div>
                <div>
                  <p className="text-[#36454F] font-bold text-sm mb-0.5">Retail Sales</p>
                  <p className="text-xs text-slate-500 font-medium">{summary?.pos?.salesCount || 0} items sold</p>
                </div>
              </div>
              <p className="text-xl font-bold text-[#36454F] tracking-tight">
                {summary ? Number(summary.pos?.totalAmount || 0).toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029] shrink-0">
                  <div className="text-[10px] font-black">BKG</div>
                </div>
                <div>
                  <p className="text-[#36454F] font-bold text-sm mb-0.5">Booking Revenue</p>
                  <p className="text-xs text-slate-500 font-medium">{summary?.bookings?.confirmedOrCompleted ?? 0} confirmed</p>
                </div>
              </div>
              <p className="text-xl font-bold text-[#36454F] tracking-tight">
                {summary ? Number(summary.bookings?.revenueAmount || 0).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
            <div className="p-4 flex items-center gap-2 border-b border-slate-100">
              <Receipt className="text-[#CE2029]" size={18} />
              <h3 className="text-lg font-extrabold text-[#36454F]">Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#36454F]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-none">Date</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-none">Time</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-none">Player</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-none">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-none">Method</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-none">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[13px]">
                  {paymentList.map((pay, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 font-medium">{pay.displayDate}</td>
                      <td className="px-4 py-3.5 text-slate-400 font-medium">{pay.displayTime}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-[#36454F] leading-tight">{pay.player}</p>
                        {pay.phone && <p className="text-[9px] text-slate-500 font-medium tracking-wide mt-0.5">{pay.phone}</p>}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#CE2029]">OMR {pay.amount}</td>
                      <td className="px-4 py-3.5 text-slate-600 uppercase text-[10px] font-bold tracking-wider">{pay.method}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded" style={{ backgroundColor: pay.statusBg, color: pay.statusText }}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paymentList.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-slate-400 italic">No payments recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
