import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, Video, Users, ClipboardCheck, ChevronRight } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const mockSchedule = [
  { id: 1, time: '06:00 AM - 08:00 AM', batch: 'Morning Elite', level: 'Advanced', students: 12, arena: 'Olympic Smash, Court 1', type: 'Offline' },
  { id: 2, time: '04:00 PM - 06:00 PM', batch: 'Junior Stars', level: 'Beginner', students: 8, arena: 'Badminton Hub, Court 3', type: 'Offline' },
  { id: 3, time: '07:00 PM - 08:30 PM', batch: 'Pro Analytics', level: 'Intermediate', students: 15, arena: 'Zoom Video', type: 'Online' },
];

const CoachDashboard = () => {
  const { isDark } = useTheme();

  const stats = [
    { label: 'Today', value: '3', sub: 'Sessions', icon: Calendar, color: 'text-red-500' },
    { label: 'Students', value: '35', sub: 'Active', icon: Users, color: 'text-blue-500' },
    { label: 'Attendance', value: '92%', sub: 'Avg.', icon: ClipboardCheck, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-10 px-0.5">
      {/* Welcome & Stats Section */}
      <div className="space-y-4 pt-1">
        <div className="px-1.5">
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#1a1d24]'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
            Dashboard
          </h1>
          <p className={`text-[10px] font-bold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-slate-500'}`}>
            Track your performance and sessions
          </p>
        </div>

        {/* Quick Stats Grid - More Compact & Icon Focused */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                isDark 
                  ? 'bg-[#1a1d24] border-white/5 shadow-xl' 
                  : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="mb-2">
                <stat.icon size={22} className={stat.color} strokeWidth={2.5} />
              </div>
              <p className={`text-lg font-black leading-none ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{stat.value}</p>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1.5">
          <h2 className={`text-sm font-bold tracking-tight uppercase opacity-60 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            Today's <span className="text-[#CE2029]">Timeline</span>
          </h2>
          <Link to="/coach/schedule" className="text-[#CE2029] text-[9px] font-black tracking-widest uppercase hover:underline">Calendar</Link>
        </div>

        <div className="space-y-2.5">
          {mockSchedule.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className={`relative group rounded-xl border overflow-hidden transition-all ${
                isDark 
                  ? 'bg-[#1a1d24] border-white/5 shadow-lg' 
                  : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              {/* Thinner Top Accent Bar - Solid for all cards */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-[#1a1d24]`}/>
              
              <div className="p-3 md:p-4 flex flex-col md:flex-row gap-4">
                {/* Compact Left Side */}
                <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start md:border-r md:pr-5 border-slate-100 dark:border-white/5 gap-1.5">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                    isDark ? 'bg-white/5 text-white/50' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Clock size={10} className="text-[#CE2029]" />
                    {session.time.split(' - ')[0]}
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                    session.type === 'Online' 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'bg-[#CE2029]/5 text-[#CE2029]'
                  }`}>
                    {session.type}
                  </div>
                </div>

                {/* Compact Center Info */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-sm font-black leading-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                        {session.batch}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                          {session.type === 'Online' ? <Video size={11} className="text-[#CE2029]" /> : <MapPin size={11} className="text-[#CE2029]" />}
                          <span className="truncate max-w-[100px] md:max-w-none">{session.arena}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold border-l pl-2 dark:border-white/5 uppercase tracking-tight">
                          <Users size={11} className="text-[#CE2029]" />
                          <span>{session.students} Seats</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border tracking-widest uppercase ${
                      session.level === 'Advanced' 
                        ? 'border-red-500/20 text-red-500 bg-red-500/5' 
                        : 'border-slate-500/20 text-slate-500 bg-slate-500/5'
                    }`}>
                      {session.level}
                    </span>
                  </div>

                  {/* Actions - More Compact Buttons */}
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/coach/attendance"
                      className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-[#CE2029] text-white font-bold text-[9px] uppercase tracking-widest shadow shadow-[#CE2029]/10 active:scale-95 transition-all"
                    >
                      <ClipboardCheck size={12} /> Attendance
                    </Link>
                    <Link 
                      to="/coach/students"
                      className={`flex items-center justify-center h-[34px] w-[34px] rounded-lg border transition-all active:scale-95 ${
                        isDark ? 'bg-white/5 border-white/5 text-white/30 hover:text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029]'
                      }`}
                    >
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
