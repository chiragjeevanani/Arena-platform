import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, Video, Users, ClipboardCheck } from 'lucide-react';

import { useTheme } from '../../user/context/ThemeContext';

const mockSchedule = [
  { id: 1, time: '06:00 AM - 08:00 AM', batch: 'Morning Elite', level: 'Advanced', students: 12, arena: 'Olympic Smash, Court 1', type: 'Offline' },
  { id: 2, time: '04:00 PM - 06:00 PM', batch: 'Junior Stars', level: 'Beginner', students: 8, arena: 'Badminton Hub, Court 3', type: 'Offline' },
  { id: 3, time: '07:00 PM - 08:30 PM', batch: 'Pro Analytics', level: 'Intermediate', students: 15, arena: 'Zoom Video', type: 'Online' },
];

const CoachDashboard = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Calendar className="text-[#FFD600]" /> Today's Agenda
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">You have <span className="text-[#22FF88]">3 critical sessions</span> to lead today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockSchedule.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, scale: 0.98, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 md:p-8 rounded-[2.5rem] border transition-all duration-300 group hover:shadow-2xl ${
              isDark 
                ? `${session.type === 'Online' ? 'bg-gradient-to-br from-[#1EE7FF]/10 to-[#0A1F44]/50 border-[#1EE7FF]/20' : 'bg-[#0A1F44]/50 border-white/5'} hover:bg-[#0A1F44] hover:shadow-[#1EE7FF]/2`
                : `${session.type === 'Online' ? 'bg-gradient-to-br from-[#1EE7FF]/5 to-white border-[#1EE7FF]/20 shadow-lg shadow-blue-500/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'} hover:border-[#FFD600]`
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                   <div>
                     <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{session.batch}</h3>
                     <div className="flex gap-2 mt-2">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                          session.level === 'Advanced' ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20' : 
                          session.level === 'Intermediate' ? 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20' : 
                          'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20'
                        }`}>
                          {session.level} Level
                        </span>
                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                          session.type === 'Online' ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border-[#1EE7FF]/20' : 'bg-white/5 border-white/10 text-white/40'
                        }`}>
                          {session.type} Mode
                        </span>
                     </div>
                   </div>
                   <div className={`flex items-center gap-3 text-[#22FF88] font-black text-2xl px-5 py-3 rounded-2xl border font-display transition-all group-hover:bg-[#22FF88] group-hover:text-[#0A1F44] ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                     <Clock size={20} />
                     {session.time}
                   </div>
                </div>
                
                <div className={`flex flex-wrap items-center gap-6 mt-4 border-t pt-5 ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
                  <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
                    {session.type === 'Online' ? <Video size={16} className="text-[#1EE7FF]" /> : <MapPin size={16} className="text-[#22FF88]" />}
                    <span className={session.type === 'Online' ? 'text-[#1EE7FF]' : 'text-[#22FF88]'}>{session.arena}</span>
                  </div>
                  <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
                    <Users size={16} className="text-[#FFD600]" />
                    {session.students} Active Students
                  </div>
                </div>
              </div>
              
              <div className={`flex flex-col border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 shrink-0 justify-center ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
                 <button className="flex items-center gap-3 justify-center w-full md:w-56 px-6 py-4 rounded-2xl bg-[#22FF88] border border-transparent hover:bg-white hover:border-[#22FF88]/50 text-[#0A1F44] transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#22FF88]/20">
                   <ClipboardCheck size={18} /> Take Attendance
                 </button>
                 <button className={`mt-3 flex items-center gap-3 justify-center w-full px-6 py-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-[#0A1F44]/5 border-black/5 text-[#0A1F44]/40 hover:text-black'}`}>
                    View Batch Details
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default CoachDashboard;
