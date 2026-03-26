import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCheck, Search, Filter, Shield, MoreVertical, Plus, CheckCircle2, XCircle } from 'lucide-react';

const GUESTS = [
  { id: 1, name: 'Amit Kumar', phone: '9876543210', court: 'Court 1', time: '05:00 PM - 06:00 PM', status: 'Checked-in' },
  { id: 2, name: 'Siddharth Jain', phone: '9876543211', court: 'Court 4', time: '04:00 PM - 05:00 PM', status: 'Pending' },
  { id: 3, name: 'Priyanaka Das', phone: '9876543212', court: 'Court 2', time: '06:00 PM - 07:00 PM', status: 'Checked-in' },
  { id: 4, name: 'Vikram Mehta', phone: '9876543213', court: 'Court 1', time: '07:00 PM - 08:00 PM', status: 'Departed' },
];

const GuestSystem = () => {
  const [guests, setGuests] = useState(GUESTS);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#1a2b3c]">Guest Check-in System</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage non-registered visitors and walk-in players</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#1a2b3c] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#1a2b3c]/20 hover:-translate-y-0.5 transition-all outline-none"
        >
          <UserPlus size={16} strokeWidth={3} /> Quick Check-in
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { label: 'In-Arena Now', value: '12', icon: UserCheck, color: '#22c55e' },
           { label: 'Pending Check-ins', value: '05', icon: Search, color: '#6366f1' },
           { label: 'Total Guests Today', value: '28', icon: Shield, color: '#eb483f' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-[#1a2b3c] mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center italic" style={{ backgroundColor: `${stat.color}15` }}>
                 <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2.5} />
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a2b3c]">Live Guest Status</h3>
           <div className="flex items-center gap-2">
              <input type="text" placeholder="Search by name/phone..." className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 rounded-lg px-3 py-1.5 outline-none focus:border-[#eb483f] transition-all" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest Info</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Allocation</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {guests.map(guest => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-all">
                     <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#1a2b3c]">{guest.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{guest.phone}</p>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f]" />
                          <p className="text-[11px] font-black text-[#1a2b3c] uppercase tracking-widest">{guest.court}</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{guest.time}</p>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${
                             guest.status === 'Checked-in' ? 'bg-green-50 text-green-500 border-green-100' : 
                             guest.status === 'Pending' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                             'bg-slate-50 text-slate-400 border-slate-100'
                           }`}>
                             {guest.status}
                           </span>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                           {guest.status === 'Pending' && (
                             <button className="p-2 bg-green-500 text-white rounded-lg hover:scale-105 transition-all"><UserCheck size={14} /></button>
                           )}
                           <button className="p-2 border border-slate-100 text-slate-400 hover:text-[#eb483f] rounded-lg transition-all"><MoreVertical size={14} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuestSystem;
