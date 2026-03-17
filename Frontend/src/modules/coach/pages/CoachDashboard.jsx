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
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-wide flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Calendar className="text-[#eb483f]" size={20} /> Today's Agenda
          </h2>
          <p className={`text-[11px] md:text-sm mt-0.5 md:mt-1 font-medium ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>You have <span className="text-[#eb483f]">3 sessions</span> today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockSchedule.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, scale: 0.98, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border transition-all duration-300 group hover:shadow-2xl ${
              isDark 
                ? `${session.type === 'Online' ? 'bg-gradient-to-br from-[#eb483f]/10 to-[#0A1F44]/50 border-[#eb483f]/20' : 'bg-[#0A1F44]/50 border-white/5'} hover:bg-[#0A1F44] hover:shadow-[#eb483f]/5`
                : `${session.type === 'Online' ? 'bg-gradient-to-br from-[#eb483f]/5 to-white border-[#eb483f]/20 shadow-lg shadow-red-500/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'} hover:border-[#eb483f]`
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                   <div>
                     <h3 className={`text-lg md:text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{session.batch}</h3>
                     <div className="flex gap-2 mt-1 md:mt-2">
                        <span className={`px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                          session.level === 'Advanced' ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20' : 
                          session.level === 'Intermediate' ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' : 
                          'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20'
                        }`}>
                          {session.level}
                        </span>
                        <span className={`px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                          session.type === 'Online' ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/10 text-[#0A1F44]/40'
                        }`}>
                          {session.type}
                        </span>
                     </div>
                   </div>
                   <div className={`flex items-center gap-2 md:gap-3 text-[#eb483f] font-black text-lg md:text-2xl px-4 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border font-display transition-all group-hover:bg-[#eb483f] group-hover:text-white ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#eb483f]/10 shadow-sm'}`}>
                     <Clock size={16} className="md:w-[20px] md:h-[20px]" />
                     {session.time}
                   </div>
                </div>
                
                <div className={`flex flex-wrap items-center gap-4 md:gap-6 mt-3 md:mt-4 border-t pt-4 md:pt-5 ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
                  <div className={`flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>
                    {session.type === 'Online' ? <Video size={14} className="text-[#eb483f]" /> : <MapPin size={14} className="text-[#eb483f]" />}
                    <span className="text-[#eb483f]">{session.arena}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>
                    <Users size={14} className="text-[#eb483f]" />
                    <span className={isDark ? 'text-white' : 'text-[#0A1F44]'}>{session.students} Students</span>
                  </div>
                </div>
              </div>
              
              <div className={`flex flex-col border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 shrink-0 justify-center gap-2 ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
                 <button className="flex items-center gap-2 md:gap-3 justify-center w-full md:w-52 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#eb483f] border border-transparent hover:bg-white hover:border-[#eb483f] text-white hover:text-[#eb483f] transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-[#eb483f]/20">
                   <ClipboardCheck size={16} /> Take Attendance
                 </button>
                 <button className={`flex items-center gap-2 md:gap-3 justify-center w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:border-[#eb483f] hover:text-[#0A1F44]'}`}>
                    Batch Details
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
