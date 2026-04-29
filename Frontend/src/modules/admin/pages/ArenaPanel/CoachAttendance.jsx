import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Clock, Calendar, CheckCircle2, Search } from 'lucide-react';
import { apiJson } from '../../../../services/apiClient';

const CoachAttendance = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({}); // { coachId: { status, checkIn } }
  const [arenaId, setArenaId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, arenaRes] = await Promise.all([
          apiJson('/api/arena-admin/list-staff?role=COACH'),
          apiJson('/api/arena-admin/arena')
        ]);
        
        console.log('CoachAttendance FETCH:', { usersRes, arenaRes });
        setCoaches(usersRes.users || []);
        const aid = arenaRes?.arena?.id || arenaRes?.arena?._id;
        setArenaId(aid);

        if (aid) {
          const attRes = await apiJson(`/api/arena-admin/staff-attendance?arenaId=${aid}&date=${date}`);
          const map = {};
          (attRes.attendance || []).forEach(a => {
            const sid = a.staffId?._id || a.staffId?.id || a.staffId;
            map[sid] = a;
          });
          setAttendanceMap(map);
        }
      } catch (err) {
        console.error('Failed to fetch coaches/attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const handleMarkAttendance = async (coachId, status) => {
    if (!arenaId) {
      alert('Arena ID not found');
      return;
    }

    try {
      const payload = {
        staffId: coachId,
        arenaId,
        date,
        status,
        checkIn: attendanceMap[coachId]?.checkIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      };

      await apiJson('/api/arena-admin/staff-attendance', { method: 'POST', body: payload });
      
      setAttendanceMap(prev => ({
        ...prev,
        [coachId]: { ...prev[coachId], ...payload }
      }));

      setToast(`Attendance marked as ${status}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      alert('Failed to mark attendance');
    }
  };

  const handleCheckOut = async (coachId) => {
    if (!arenaId) return;
    try {
      const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const payload = {
        staffId: coachId,
        arenaId,
        date,
        checkOut: checkOutTime,
      };

      await apiJson('/api/arena-admin/staff-attendance', { method: 'POST', body: payload });
      
      setAttendanceMap(prev => ({
        ...prev,
        [coachId]: { ...prev[coachId], checkOut: checkOutTime }
      }));

      setToast(`Checked out at ${checkOutTime}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to check out:', err);
      alert('Failed to check out');
    }
  };

  const filteredCoaches = coaches.filter(c => {
    const name = (c.name || `${c.firstName || ''} ${c.lastName || ''}`).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#36454F]">Coach Attendance</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mark and monitor coach presence at the arena</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search Coach..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold w-48 outline-none focus:border-[#CE2029]"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Calendar size={14} className="text-[#CE2029]" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#CE2029] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Coach Roster...</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No coaches found</p>
          </div>
        ) : filteredCoaches.map(coach => {
          const cid = coach.id || coach._id;
          const att = attendanceMap[cid];
          return (
            <motion.div 
              key={cid}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#CE2029]/5 border border-[#CE2029]/10 flex items-center justify-center text-[#CE2029] text-lg font-black shrink-0 shadow-inner group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                  {(coach.name || coach.firstName || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[#36454F] text-sm truncate uppercase tracking-tight">{coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {String(cid).slice(-8).toUpperCase()}</p>
                </div>
                {att && (
                  <div className={`w-2 h-2 rounded-full ${att.status === 'present' ? 'bg-emerald-500' : att.status === 'late' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                )}
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center px-2.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry / Exit</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#36454F] flex items-center gap-1">
                      <Clock size={10} className="text-[#CE2029]" />
                      {att?.checkIn || '—'}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-[10px] font-black text-[#36454F] flex items-center gap-1">
                      {att?.checkOut || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleMarkAttendance(cid, 'present')}
                    className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${att?.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                  >
                    Present
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(cid, 'late')}
                    className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${att?.status === 'late' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
                  >
                    Late
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(cid, 'absent')}
                    className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${att?.status === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                  >
                    Absent
                  </button>
                </div>
                
                {att?.status && att?.status !== 'absent' && (
                  <button 
                    onClick={() => handleCheckOut(cid)}
                    disabled={!!att?.checkOut}
                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      att?.checkOut 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-[#1e293b] text-white hover:bg-black shadow-lg'
                    }`}
                  >
                    {att?.checkOut ? 'Checked Out' : 'Mark Check-Out'}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl bg-[#1e293b] text-white text-[13px] font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
               <CheckCircle2 size={14} />
            </div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachAttendance;
