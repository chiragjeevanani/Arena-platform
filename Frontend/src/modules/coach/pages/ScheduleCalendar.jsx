import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin,
  Users, Video, X, Layers, Info
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM'];

const SESSIONS = [
  { id: 1, batch: 'Morning Elite', dayIdx: 1, startHour: 6, duration: 2, students: 12, court: 'Court 1', arena: 'Olympic Smash', type: 'Offline', color: '#eb483f', level: 'Advanced' },
  { id: 2, batch: 'Junior Stars', dayIdx: 2, startHour: 8, duration: 1.5, students: 8, court: 'Court 3', arena: 'Badminton Hub', type: 'Offline', color: '#1a2b3c', level: 'Beginner' },
  { id: 3, batch: 'Pro Analytics', dayIdx: 3, startHour: 13, duration: 1.5, students: 15, court: 'Zoom', arena: 'Online', type: 'Online', color: '#6366f1', level: 'Intermediate' },
  { id: 4, batch: 'Morning Elite', dayIdx: 3, startHour: 6, duration: 2, students: 12, court: 'Court 1', arena: 'Olympic Smash', type: 'Offline', color: '#eb483f', level: 'Advanced' },
  { id: 5, batch: 'Evening Drill', dayIdx: 4, startHour: 11, duration: 2, students: 10, court: 'Court 2', arena: 'Olympic Smash', type: 'Offline', color: '#f59e0b', level: 'Intermediate' },
  { id: 6, batch: 'Junior Stars', dayIdx: 5, startHour: 8, duration: 1.5, students: 8, court: 'Court 3', arena: 'Badminton Hub', type: 'Offline', color: '#1a2b3c', level: 'Beginner' },
];

const HOUR_START = 6;
const CELL_HEIGHT = 44; // compact

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

const fmtHour = (h) => {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:00 ${suffix}`;
};

const ScheduleCalendar = () => {
  const { isDark } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const weekDates = getWeekDates(weekOffset);
  const todayDayIdx = getToday();

  const sessionTop = (startHour) => (startHour - HOUR_START) * CELL_HEIGHT;
  const sessionHeight = (duration) => Math.max(duration * CELL_HEIGHT - 3, 28);

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto relative">

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] rounded-2xl border shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#1a1d24] border-white/15' : 'bg-white border-slate-200'
              }`}
            >
              <div className="h-1" style={{ backgroundColor: selectedSession.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${selectedSession.color}22`, color: selectedSession.color }}>
                      {selectedSession.type === 'Online' ? <Video size={17} /> : <Layers size={17} />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{selectedSession.batch}</h3>
                      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: selectedSession.color }}>{selectedSession.level} · {selectedSession.type}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSession(null)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Time', value: `${fmtHour(selectedSession.startHour)} — ${fmtHour(selectedSession.startHour + selectedSession.duration)}`, icon: Clock },
                    { label: 'Students', value: `${selectedSession.students} Enrolled`, icon: Users },
                    { label: 'Arena', value: selectedSession.arena, icon: MapPin },
                    { label: 'Court', value: selectedSession.court, icon: Info },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon size={9} className="text-[#eb483f]" />
                        <span className="text-[7px] font-semibold uppercase tracking-widest text-[#eb483f]">{label}</span>
                      </div>
                      <p className={`text-[10px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-[#eb483f] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#1a2b3c] transition-all shadow-md shadow-[#eb483f]/20">
                    Mark Attendance
                  </button>
                  <button className={`px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${isDark ? 'border-white/15 text-white/50 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:border-[#eb483f] hover:text-[#eb483f]'}`}>
                    Students
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-semibold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
            <CalendarDays className="text-[#eb483f]" size={20} /> Schedule Calendar
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            View and manage your weekly coaching sessions.
          </p>
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
              weekOffset === 0
                ? 'bg-[#eb483f] text-white border-[#eb483f]'
                : isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-slate-200 text-slate-600'
            }`}>Today</button>
          <button onClick={() => setWeekOffset(w => w - 1)} className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-[#eb483f] hover:text-[#eb483f]'}`}>
            <ChevronLeft size={15} />
          </button>
          <span className={`text-[11px] font-semibold min-w-[120px] text-center ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
            {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-[#eb483f] hover:text-[#eb483f]'}`}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Sessions This Week', value: SESSIONS.length, icon: CalendarDays },
          { label: 'Total Students', value: SESSIONS.reduce((a, b) => a + b.students, 0), icon: Users },
          { label: 'Hours Scheduled', value: `${SESSIONS.reduce((a, b) => a + b.duration, 0)}h`, icon: Clock },
        ].map((stat, i) => (
          <div key={i} className={`px-3 py-2.5 rounded-xl border shadow-sm flex items-center gap-2.5 ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="w-7 h-7 rounded-lg bg-[#eb483f]/10 flex items-center justify-center shrink-0">
              <stat.icon size={14} className="text-[#eb483f]" />
            </div>
            <div>
              <p className={`text-[7px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{stat.label}</p>
              <p className={`text-base font-bold tracking-tight leading-none mt-0.5 ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/8' : 'bg-white border-slate-200'}`}>
        {/* Day Headers */}
        <div className={`grid border-b ${isDark ? 'border-white/8' : 'border-slate-200'}`} style={{ gridTemplateColumns: '44px repeat(7, 1fr)' }}>
          <div className={`border-r ${isDark ? 'border-white/8' : 'border-slate-200'}`} />
          {weekDates.map((date, i) => {
            const isToday = weekOffset === 0 && i === todayDayIdx;
            return (
              <div key={i} className={`py-2 px-1 text-center border-r ${isDark ? 'border-white/8' : 'border-slate-200'} ${isToday ? isDark ? 'bg-[#eb483f]/10' : 'bg-[#eb483f]/5' : ''}`}>
                <p className={`text-[8px] font-semibold uppercase tracking-widest ${isToday ? 'text-[#eb483f]' : isDark ? 'text-white/40' : 'text-slate-400'}`}>{DAYS[i]}</p>
                <div className={`mx-auto mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isToday ? 'bg-[#eb483f] text-white' : isDark ? 'text-white/70' : 'text-[#1a2b3c]'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time + Sessions Grid */}
        <div className="overflow-y-auto" style={{ maxHeight: 440 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)' }}>
            {/* Time labels */}
            <div className={`border-r ${isDark ? 'border-white/8' : 'border-slate-200'}`}>
              {HOURS.map((hour, hIdx) => (
                <div key={hour} style={{ height: CELL_HEIGHT }}
                  className={`flex items-start justify-end pr-1.5 pt-1 border-b ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                  <span className={`text-[8px] font-bold tabular-nums ${isDark ? 'text-white/25' : 'text-slate-400'}`}>{hour}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((_, dayIdx) => {
              const daySessions = SESSIONS.filter(s => s.dayIdx === dayIdx);
              const isToday = weekOffset === 0 && dayIdx === todayDayIdx;
              return (
                <div key={dayIdx}
                  className={`relative border-r ${isDark ? 'border-white/8' : 'border-slate-200'} ${isToday ? isDark ? 'bg-[#eb483f]/[0.03]' : 'bg-[#eb483f]/[0.02]' : ''}`}
                  style={{ height: HOURS.length * CELL_HEIGHT }}>
                  {/* Hour dividers */}
                  {HOURS.map((_, hIdx) => (
                    <div key={hIdx}
                      className={`absolute left-0 right-0 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}
                      style={{ top: (hIdx + 1) * CELL_HEIGHT }} />
                  ))}

                  {/* Session blocks */}
                  {daySessions.map(session => (
                    <motion.button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      whileHover={{ scale: 1.03, zIndex: 10 }}
                      whileTap={{ scale: 0.97 }}
                      className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 text-left overflow-hidden shadow-md cursor-pointer"
                      style={{
                        top: sessionTop(session.startHour),
                        height: sessionHeight(session.duration),
                        backgroundColor: session.color,
                        zIndex: 5,
                      }}
                    >
                      <p style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', fontSize: '11px', fontWeight: 500, lineHeight: '1.3' }} className="truncate">
                        {session.batch}
                      </p>
                      {session.duration >= 1 && (
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '9px', fontWeight: 400 }} className="truncate">
                          {session.students}👤 · {session.court}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
        <span className={`text-[7px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Batches:</span>
        {[
          { color: '#eb483f', label: 'Morning Elite' },
          { color: '#1a2b3c', label: 'Junior Stars' },
          { color: '#6366f1', label: 'Pro Analytics' },
          { color: '#f59e0b', label: 'Evening Drill' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className={`text-[9px] font-semibold ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
