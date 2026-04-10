import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Clock, PenTool, CheckCircle2, MoreVertical, Plus, AlertCircle, Info, ChevronRight } from 'lucide-react';

const TASKS = [
  { id: 1, court: 'Court 1', task: 'Floor Polishing', date: 'Mar 28, 2024', time: '05:00 AM - 09:00 AM', status: 'Scheduled', staff: 'Rajesh T.' },
  { id: 2, court: 'Court 3', task: 'Net Tightening', date: 'Mar 25, 2024', time: '11:00 PM - 12:00 AM', status: 'Completed', staff: 'Pramod K.' },
  { id: 3, court: 'Court 5', task: 'Lighting Repair', date: 'Mar 30, 2024', time: '02:00 PM - 03:00 PM', status: 'Pending', staff: 'Unassigned' },
  { id: 4, court: 'All Courts', task: 'Sanitization', date: 'Daily', time: '04:00 AM - 05:00 AM', status: 'Routine', staff: 'Sanitation Team' },
];

const MaintenanceScheduler = () => {
  const [tasks, setTasks] = useState(TASKS);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
              <PenTool size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black tracking-tight text-[#36454F]">Maintenance & Service</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Schedule court repairs & routine facility maintenance</p>
           </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#CE2029] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#CE2029]/20 hover:scale-105 transition-all outline-none"
        >
          <Plus size={18} strokeWidth={3} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#36454F]">Scheduled Works</h3>
           </div>
           
           <div className="overflow-x-auto overflow-y-auto max-h-[500px] flex-1">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Target Court</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Task Details</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Schedule</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Status</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {tasks.map(task => (
                       <tr key={task.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#CE2029]" />
                                <span className="text-[11px] font-black text-[#36454F] uppercase tracking-widest">{task.court}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <p className="text-sm font-black text-[#36454F] mb-0.5">{task.task}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assignee: {task.staff}</p>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar size={12} />
                                <span className="text-[10px] font-black">{task.date}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                <Clock size={12} />
                                <span className="text-[10px] font-black">{task.time}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${
                               task.status === 'Completed' ? 'bg-green-50 text-green-500 border-green-100' :
                               task.status === 'Scheduled' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                               task.status === 'Routine' ? 'bg-[#36454F]/5 text-[#36454F] border-[#36454F]/10' :
                               'bg-amber-50 text-amber-500 border-amber-100'
                             }`}>
                               {task.status}
                             </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-[#CE2029] transition-all"><MoreVertical size={14} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Calendar / Reminder Panel */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#36454F] p-6 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <AlertCircle size={100} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CE2029] mb-6 underline underline-offset-8">Critical Alerts</h3>
                 <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                       <AlertCircle size={20} className="text-[#CE2029] shrink-0" />
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight">Court 1 Lighting</p>
                          <p className="text-[11px] font-bold text-white/50 leading-relaxed">3 panels flickering. Requires electrician by tomorrow.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                       <Info size={20} className="text-[#6366f1] shrink-0" />
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight">Monthly Inspection</p>
                          <p className="text-[11px] font-bold text-white/50 leading-relaxed">Full arena safety audit scheduled for April 05.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#36454F] mb-6">Staff Performance</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Pramod Kumar', tasks: 12, rating: 4.8 },
                   { name: 'Rajesh Tyagi', tasks: 15, rating: 4.9 },
                   { name: 'Sanjay Rawat', tasks: 8, rating: 4.5 }
                 ].map((staff, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase">
                            {staff.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-[11px] font-black uppercase tracking-tight text-[#36454F]">{staff.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 capitalize">{staff.tasks} Works Completed</p>
                         </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduler;
