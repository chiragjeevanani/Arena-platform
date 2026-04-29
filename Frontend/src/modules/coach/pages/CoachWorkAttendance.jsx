import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { listCoachWorkAttendance } from '../../../services/coachApi';

const CoachWorkAttendance = () => {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await listCoachWorkAttendance();
        setLogs(res.attendance || []);
      } catch (err) {
        console.error('Failed to fetch work logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const stats = {
    present: logs.filter(l => l.status === 'present').length,
    late: logs.filter(l => l.status === 'late').length,
    absent: logs.filter(l => l.status === 'absent').length,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className={`text-xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
          <UserCheck className="text-[#CE2029]" size={22} /> Work Attendance Logs
        </h2>
        <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          View your daily check-in and check-out history marked by the arena admin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Present', value: stats.present, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Late', value: stats.late, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Absent', value: stats.absent, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-3xl border ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Arena</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-50'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    No work logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={log._id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <Calendar size={14} className="text-[#CE2029]" />
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                          {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                        {log.arenaId?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-emerald-500" />
                        <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                          {log.checkIn || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#CE2029]" />
                        <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                          {log.checkOut || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        log.status === 'present' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                        log.status === 'late' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                        'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/5 text-white/60' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
        <AlertCircle size={20} className="text-[#CE2029] shrink-0" />
        <p className="text-[10px] font-bold leading-relaxed">
          These logs are recorded by the arena management upon your arrival and departure. If you notice any discrepancy, please contact your arena manager.
        </p>
      </div>
    </div>
  );
};

export default CoachWorkAttendance;
