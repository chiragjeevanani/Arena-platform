import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Briefcase, Plus, MoreVertical, Trash2, Edit2, ShieldAlert } from 'lucide-react';

const STAFF = [
  { id: 1, name: 'Rahul Khanna', role: 'Front Desk', status: 'Active', phone: '9876543210', email: 'rahul@amm.com' },
  { id: 2, name: 'Pradeep Sahani', role: 'Operations', status: 'Active', phone: '9876543211', email: 'pradeep@amm.com' },
  { id: 3, name: 'Suman Deep', role: 'Front Desk', status: 'Away', phone: '9876543212', email: 'suman@amm.com' },
  { id: 4, name: 'Rajesh Tyagi', role: 'Referee', status: 'Active', phone: '9876543213', email: 'rajesh@amm.com' },
];

const StaffManagement = () => {
  const [staff, setStaff] = useState(STAFF);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#36454F]">Staff Management</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage arena staff and permissions</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#CE2029] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#CE2029]/20 hover:scale-105 transition-all outline-none"
        >
          <Plus size={16} strokeWidth={3} /> Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Staff Member</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Role</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Contact</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#36454F]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {staff.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029] text-xs font-black">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#36454F]">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 tracking-wider">ID: STF-10{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.role === 'Front Desk' ? 'bg-[#CE2029]' : 'bg-[#6366f1]'}`} />
                      <span className="text-[11px] font-black text-[#36454F] uppercase tracking-widest">{s.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      s.status === 'Active' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-amber-50 text-amber-500 border-amber-100'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-black text-[#36454F]">{s.email}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{s.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-[#CE2029]/10 hover:text-[#CE2029] rounded-lg transition-all"><Edit2 size={14} /></button>
                       <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Permissions Guide */}
       <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
          <ShieldAlert className="absolute top-1/2 -translate-y-1/2 right-6 opacity-10 group-hover:scale-110 transition-all" size={120} />
          <div className="relative z-10">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Role Permissions Hub</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Front Desk', info: 'Can create walk-in bookings & process payments.' },
                  { title: 'Operations', info: 'Can manage maintenance & staff schedules.' },
                  { title: 'Referee', info: 'Can manage court assignments & match scoring.' }
                ].map((role, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md">
                    <p className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest mb-1.5">{role.title}</p>
                    <p className="text-[11px] font-bold text-white/60 leading-relaxed">{role.info}</p>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default StaffManagement;
