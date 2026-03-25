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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
            <Calendar className="text-[#eb483f]" size={24} /> Today's Agenda
          </h2>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            You have <span className="text-[#eb483f] font-bold">3 sessions</span> scheduled for today.
          </p>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 gap-4">
        {mockSchedule.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-xl border shadow-sm transition-all hover:border-[#eb483f]/40 overflow-hidden group ${
              isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* Type Indicator */}
              <div className={`w-1.5 shrink-0 ${session.type === 'Online' ? 'bg-[#eb483f]' : 'bg-[#1a2b3c]'}`} />
              
              <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
                        {session.batch}
                      </h3>
                      <div className="flex gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                          session.level === 'Advanced' ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20' : 
                          'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20'
                        }`}>
                          {session.level}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                          session.type === 'Online' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                        } ${isDark ? 'bg-white/5 border-white/10 text-white/40' : ''}`}>
                          {session.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border font-bold transition-all group-hover:bg-[#eb483f] group-hover:text-white group-hover:border-[#eb483f] ${
                      isDark ? 'bg-white/5 border-white/10 text-[#eb483f]' : 'bg-slate-50 border-slate-200 text-[#1a2b3c]'
                    }`}>
                      <Clock size={16} />
                      <span className="text-base">{session.time}</span>
                    </div>
                  </div>
                  
                  <div className={`flex flex-wrap items-center gap-5 mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {session.type === 'Online' ? <Video size={14} className="text-[#eb483f]" /> : <MapPin size={14} className="text-[#eb483f]" />}
                      <span className={`${isDark ? 'text-white/60' : 'text-slate-600'}`}>{session.arena}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Users size={14} className="text-[#eb483f]" />
                      <span className={`${isDark ? 'text-white/60' : 'text-slate-600'}`}>{session.students} Students</span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex flex-col border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 shrink-0 justify-center gap-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <Link 
                    to="/coach/attendance"
                    className="flex items-center gap-2 justify-center w-full lg:w-40 px-5 py-2.5 rounded-lg bg-[#eb483f] text-white hover:bg-[#1a2b3c] transition-all font-bold text-[10px] uppercase tracking-wider shadow-sm"
                  >
                    <ClipboardCheck size={16} /> Attendance
                  </Link>
                  <Link 
                    to="/coach/students"
                    className={`flex items-center gap-2 justify-center w-full px-5 py-2.5 rounded-lg border transition-all font-bold text-[10px] uppercase tracking-wider ${
                      isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:border-[#eb483f] hover:text-[#eb483f]'
                    }`}
                  >
                    Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CoachDashboard;
