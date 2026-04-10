import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin,
  Users, Video, X, Layers, Info
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM'];

const SESSIONS = [
  { id: 1, batch: 'Morning Elite', dayIdx: 1, startHour: 6, duration: 2, students: 12, court: 'Court 1', arena: 'Olympic Smash', type: 'Offline', color: '#CE2029', level: 'Advanced' },
  { id: 2, batch: 'Junior Stars', dayIdx: 2, startHour: 8, duration: 1.5, students: 8, court: 'Court 3', arena: 'Badminton Hub', type: 'Offline', color: '#36454F', level: 'Beginner' },
  { id: 3, batch: 'Pro Analytics', dayIdx: 3, startHour: 13, duration: 1.5, students: 15, court: 'Zoom', arena: 'Online', type: 'Online', color: '#6366f1', level: 'Intermediate' },
  { id: 4, batch: 'Morning Elite', dayIdx: 3, startHour: 6, duration: 2, students: 12, court: 'Court 1', arena: 'Olympic Smash', type: 'Offline', color: '#CE2029', level: 'Advanced' },
  { id: 5, batch: 'Evening Drill', dayIdx: 4, startHour: 11, duration: 2, students: 10, court: 'Court 2', arena: 'Olympic Smash', type: 'Offline', color: '#f59e0b', level: 'Intermediate' },
  { id: 6, batch: 'Junior Stars', dayIdx: 5, startHour: 8, duration: 1.5, students: 8, court: 'Court 3', arena: 'Badminton Hub', type: 'Offline', color: '#36454F', level: 'Beginner' },
];

const HOUR_START = 6;

const getToday = () => new Date().getDay();

const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
};

const fmtHour = (h, isMobile) => {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return isMobile ? `${hr}${suffix}` : `${hr}:00 ${suffix}`;
};

const ScheduleCalendar = () => {
  const { isDark } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const weekDates = getWeekDates(weekOffset);
  const todayDayIdx = getToday();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellHeight = isMobile ? 40 : 44;
  const sessionTop = (startHour) => (startHour - HOUR_START) * cellHeight;
  const sessionHeight = (duration) => Math.max(duration * cellHeight - (isMobile ? 2 : 3), isMobile ? 24 : 28);

  const getMonthDays = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days = [];
    for (let d = 1; d <= end.getDate(); d++) days.push(new Date(date.getFullYear(), date.getMonth(), d));
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthDays = getMonthDays(selectedDate);
  const startOffset = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  const changeMonth = (dir) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + dir, 1));
  };

  const changeYear = (dir) => {
    setSelectedDate(new Date(selectedDate.getFullYear() + dir, selectedDate.getMonth(), 1));
  };

  const DesktopView = () => (
    <div className="space-y-4">
      {/* View Switcher & Controls Header */}
      <div className={`flex flex-row justify-between items-center gap-2 pb-2 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            <CalendarDays className="text-[#CE2029]" size={22} /> Schedule Calendar
          </h2>
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            {['week', 'month'].map((m) => (
              <button 
                key={m} 
                onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === m 
                    ? 'bg-[#CE2029] text-white shadow-md shadow-[#CE2029]/20' 
                    : isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button onClick={() => { viewMode === 'week' ? setWeekOffset(w => w - 1) : changeMonth(-1); }} className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-[#CE2029] hover:text-[#CE2029]'}`}>
              <ChevronLeft size={16} />
            </button>
            <span className={`text-[11px] font-black uppercase tracking-widest min-w-[140px] text-center ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
              {viewMode === 'week' 
                ? `${weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              }
            </span>
            <button onClick={() => { viewMode === 'week' ? setWeekOffset(w => w + 1) : changeMonth(1); }} className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-[#CE2029] hover:text-[#CE2029]'}`}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-1" />
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1 dark:border-white/10">
            <button onClick={() => changeYear(-1)} className="p-1 hover:text-[#CE2029] transition-colors"><ChevronLeft size={14}/></button>
            <span className="text-[10px] font-black">{selectedDate.getFullYear()}</span>
            <button onClick={() => changeYear(1)} className="p-1 hover:text-[#CE2029] transition-colors"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: viewMode === 'week' ? 'Sessions This Week' : 'Sessions This Month', value: viewMode === 'week' ? SESSIONS.length : SESSIONS.length * 4, icon: CalendarDays },
          { label: 'Total Students', value: SESSIONS.reduce((a, b) => a + b.students, 0), icon: Users },
          { label: 'Hours Scheduled', value: `${SESSIONS.reduce((a, b) => a + b.duration, 0)}h`, icon: Clock },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl border shadow-sm flex px-3 py-2.5 items-center gap-2.5 ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="w-7 h-7 rounded-lg bg-[#CE2029]/10 flex items-center justify-center shrink-0">
              <stat.icon size={14} className="text-[#CE2029]" />
            </div>
            <div>
              <p className={`text-[7px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{stat.label}</p>
              <p className={`text-base font-bold tracking-tight leading-none mt-0.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {viewMode === 'week' ? (
        <div className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/8' : 'bg-white border-slate-200'}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)' }}>
            <div className={`border-r border-b ${isDark ? 'border-white/8' : 'border-slate-200'}`} />
            {weekDates.map((date, i) => {
              const isToday = weekOffset === 0 && i === todayDayIdx;
              return (
                <div key={i} className={`py-1.5 px-0.5 text-center border-r border-b ${isDark ? 'border-white/8' : 'border-slate-200'} ${isToday ? isDark ? 'bg-[#CE2029]/10' : 'bg-[#CE2029]/5' : ''}`}>
                  <p className={`text-[8px] font-semibold tracking-widest uppercase ${isToday ? 'text-[#CE2029]' : isDark ? 'text-white/40' : 'text-slate-400'}`}>{DAYS[i]}</p>
                  <div className={`mx-auto mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isToday ? 'bg-[#CE2029] text-white' : isDark ? 'text-white/70' : 'text-[#36454F]'}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            <div className="overflow-y-auto col-span-8" style={{ maxHeight: 440 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)' }}>
                <div className={`border-r ${isDark ? 'border-white/8' : 'border-slate-200'}`}>
                  {HOURS.map((hour) => (
                    <div key={hour} style={{ height: cellHeight }} className={`flex items-start justify-end pr-1.5 pt-1 border-b ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                      <span className={`text-[8px] font-bold tabular-nums ${isDark ? 'text-white/25' : 'text-slate-400'}`}>{hour}</span>
                    </div>
                  ))}
                </div>
                {weekDates.map((_, dayIdx) => {
                  const daySessions = SESSIONS.filter(s => s.dayIdx === dayIdx);
                  return (
                    <div key={dayIdx} className={`relative border-r ${isDark ? 'border-white/8' : 'border-slate-200'}`} style={{ height: HOURS.length * cellHeight }}>
                      {HOURS.map((_, hIdx) => (
                        <div key={hIdx} className={`absolute left-0 right-0 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`} style={{ top: (hIdx + 1) * cellHeight }} />
                      ))}
                      {daySessions.map(session => (
                        <motion.button key={session.id} onClick={() => setSelectedSession(session)} whileHover={{ scale: 1.02, zIndex: 10 }} className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-left overflow-hidden shadow-md cursor-pointer" style={{ top: sessionTop(session.startHour), height: sessionHeight(session.duration), backgroundColor: session.color, zIndex: 5 }}>
                          <p style={{ color: '#ffffff', fontSize: '11px', fontWeight: 500, lineHeight: '1.2' }} className="truncate">{session.batch}</p>
                          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '9px' }} className="truncate">{session.students}👤 · {session.court}</p>
                        </motion.button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border shadow-sm overflow-hidden p-6 ${isDark ? 'bg-[#1a1d24] border-white/8' : 'bg-white border-slate-200'}`}>
           <div className="grid grid-cols-7 gap-px overflow-hidden">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <div key={d} className="text-center py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{d}</div>
                ))}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className={`h-32 border border-transparent opacity-10 bg-slate-50 dark:bg-white/5 rounded-2xl m-1`} />
                ))}
                {getMonthDays(selectedDate).map(date => {
                    const daySessions = SESSIONS.filter(s => s.dayIdx === date.getDay());
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                        <div key={date.toISOString()} className={`min-h-[140px] border border-transparent rounded-2xl m-1 p-3 transition-all cursor-pointer ${
                            isToday ? (isDark ? 'bg-[#CE2029]/10' : 'bg-red-50/50 border-[#CE2029]/10') : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                        }`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ${
                                    isToday ? 'bg-[#CE2029] text-white shadow-lg' : isDark ? 'text-white' : 'text-slate-800'
                                }`}>{date.getDate()}</span>
                            </div>
                            <div className="space-y-1.5">
                                {daySessions.map(s => (
                                    <div key={s.id} className="flex h-5 px-2 rounded-lg items-center gap-1.5 overflow-hidden" style={{ backgroundColor: `${s.color}22` }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-[8px] font-black uppercase truncate" style={{ color: s.color }}>{s.batch}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
           </div>
        </div>
      )}
    </div>
  );

  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Mobile View - Premium Dark Stock Calendar Style
  const MobileView = () => (
    <div className={`-mx-4 -mt-4 flex flex-col min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} font-sans`}>
      
      {/* Day Details Modal - Improved Presentation */}
      <AnimatePresence>
        {isDayModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsDayModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[130]" />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className={`fixed bottom-0 left-0 right-0 max-h-[75vh] z-[140] rounded-t-[40px] border-t shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#0f1115] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col h-full bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/10 rounded-full mx-auto mt-4 mb-4" />
                
                <div className="px-8 flex items-center justify-between mb-8 pt-2">
                  <div style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl font-bold tracking-tighter">{selectedDate.getDate()}</span>
                      <div>
                        <h3 className="text-base font-bold leading-none">{monthNames[selectedDate.getMonth()]}</h3>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-40 mt-1">2026 Session Schedule</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsDayModalOpen(false)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
                    <X size={18} className="opacity-60" />
                  </button>
                </div>
                
                <div className="px-8 pb-32 space-y-3.5 overflow-y-auto">
                  {SESSIONS.filter(s => s.dayIdx === selectedDate.getDay()).length > 0 ? (
                    SESSIONS.filter(s => s.dayIdx === selectedDate.getDay()).map((session, sidx) => (
                      <motion.div 
                        key={session.id} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sidx * 0.05 }}
                        onClick={() => { setSelectedSession(session); setIsDayModalOpen(false); }}
                        className={`p-5 rounded-3xl border flex items-center justify-between transition-all active:scale-[0.97] group ${
                          isDark ? 'bg-[#1a1c1e] border-white/5 shadow-lg' : 'bg-slate-50 border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-[3px] h-12 rounded-full" style={{ backgroundColor: session.color }} />
                          <div>
                            <h4 className="text-[17px] font-black leading-tight tracking-tight">{session.batch}</h4>
                            <div className="flex items-center gap-2.5 mt-1.5 opacity-50">
                              <div className="flex items-center gap-1">
                                <Clock size={11} />
                                <span className="text-[10px] font-bold tracking-tight">{fmtHour(session.startHour, true)} — {fmtHour(session.startHour + session.duration, true)}</span>
                              </div>
                              <span className="text-xs font-black opacity-20">·</span>
                              <div className="flex items-center gap-1">
                                <MapPin size={11} />
                                <span className="text-[10px] font-bold tracking-tight truncate max-w-[80px]">{session.court}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-white group-hover:shadow-md'}`}>
                          <ChevronRight size={16} className="opacity-30 group-hover:opacity-80 transition-opacity" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                      <CalendarDays size={56} strokeWidth={1} className="mb-4" />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em]">No Sessions Booked</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header - Month & Year Switchers for Mobile */}
      <div className="flex items-center justify-between px-6 pt-10 pb-4">
        <div className="flex items-center gap-1">
          <button onClick={() => changeYear(-1)} className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/20 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`}>
            <ChevronLeft size={16} />
          </button>
          <span className={`text-sm font-black tracking-widest ${isDark ? 'text-white/80' : 'text-slate-800'}`}>{selectedDate.getFullYear()}</span>
          <button onClick={() => changeYear(1)} className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/20 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`}>
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
            <button onClick={() => changeMonth(-1)} className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/20 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`}>
                <ChevronLeft size={16} />
            </button>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Month</span>
            <button onClick={() => changeMonth(1)} className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/20 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`}>
                <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {/* Month Title - Compact & Clean */}
      <div className="px-8 pb-1 mt-2">
        <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {monthNames[selectedDate.getMonth()]}
        </h2>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 px-7 mt-8 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[11px] font-black text-slate-400/60 tracking-widest">{d}</div>
        ))}
      </div>

      {/* Scrollable Month Grid */}
      <div className="px-6 flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="grid grid-cols-7">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className={`aspect-square border-b border-r ${isDark ? 'border-white/[0.03]' : 'border-slate-50'}`} />
          ))}
          {monthDays.map(date => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const daySessions = SESSIONS.filter(s => s.dayIdx === date.getDay());
            
            return (
              <button 
                key={date.toISOString()}
                onClick={() => { setSelectedDate(date); setIsDayModalOpen(true); }}
                className={`flex flex-col items-center pt-2 pb-3 aspect-square border-b border-r transition-all relative ${
                  isDark ? 'border-white/[0.03] active:bg-white/5' : 'border-slate-50 active:bg-slate-50'
                } ${isSelected ? (isDark ? 'bg-white/[0.03]' : 'bg-red-50/30') : ''}`}
              >
                <span className={`text-[15px] font-black mb-1 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                  isToday ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/30 scale-110' : isSelected ? (isDark ? 'text-white' : 'text-[#CE2029]') : (isDark ? 'text-white/70' : 'text-slate-800')
                }`}>
                  {date.getDate()}
                </span>
                
                {/* Event Indicators - Cleaner dots */}
                <div className="flex gap-[2px] mt-0.5 min-h-[4px]">
                  {daySessions.slice(0, 3).map(session => (
                    <div key={session.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: session.color }} />
                  ))}
                  {daySessions.length > 3 && (
                    <div className="w-1 h-1 rounded-full bg-slate-400 opacity-40" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <div className="relative">
      <AnimatePresence>
        {selectedSession && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSession(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 16 }} className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[120] rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/15' : 'bg-white border-slate-200'}`}>
              <div className="h-1" style={{ backgroundColor: selectedSession.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                   <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedSession.color}22`, color: selectedSession.color }}><Video size={17} /></div>
                    <div>
                      <h3 className={`font-bold text-sm tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{selectedSession.batch}</h3>
                      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: selectedSession.color }}>{selectedSession.level}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSession(null)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-slate-100 text-slate-400'}`}><X size={15} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[{ label: 'Time', value: fmtHour(selectedSession.startHour, isMobile), icon: Clock }, { label: 'Arena', value: selectedSession.arena, icon: MapPin }].map(({ label, value, icon: Icon }) => (
                    <div key={label} className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                      <Icon size={9} className="text-[#CE2029] mb-0.5" /><span className="text-[7px] font-semibold uppercase tracking-widest text-[#CE2029] block">{label}</span>
                      <p className={`text-[10px] font-semibold leading-tight px-0.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 rounded-xl bg-[#CE2029] text-white text-[9px] font-bold uppercase tracking-widest shadow-md">Attendance</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto min-h-screen">
        {isMobile ? <MobileView /> : <DesktopView />}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
