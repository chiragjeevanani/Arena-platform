import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Search, Filter, 
  MoreVertical, Edit2, Shield, MapPin, CheckCircle, XCircle 
} from 'lucide-react';

import { useTheme } from '../../user/context/ThemeContext';

const mockUsers = [
  { id: 'USR-001', name: 'John Doe', phone: '+91 9876543210', role: 'Super Admin', arena: 'All Arenas', status: 'Active', lastLogin: '2 mins ago' },
  { id: 'USR-002', name: 'Alia Bhatt', phone: '+91 9988776655', role: 'Arena Admin', arena: 'Olympic Smash', status: 'Active', lastLogin: '1 hour ago' },
  { id: 'USR-003', name: 'Raj Kumar', phone: '+91 9871234560', role: 'Reception', arena: 'Badminton Hub', status: 'Inactive', lastLogin: '2 days ago' },
  { id: 'USR-004', name: 'Neha Sharma', phone: '+91 8877665544', role: 'Accountant', arena: 'HQ', status: 'Active', lastLogin: '5 mins ago' },
  { id: 'USR-005', name: 'Vishal Singh', phone: '+91 7766554433', role: 'Reception', arena: 'Classic Court', status: 'Active', lastLogin: '10 mins ago' },
];

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Users className="text-[#1EE7FF]" /> User Registry
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Manage system users, roles, and administrative access levels.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1EE7FF] text-[#0A1F44] hover:bg-[#22FF88] transition-all text-sm font-bold shadow-[0_0_20px_rgba(30,231,255,0.2)]">
          <UserPlus size={16} /> Add System User
        </button>
      </div>

      <div className={`rounded-3xl border overflow-hidden flex flex-col ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'}`}>
        {/* Table Toolbar */}
        <div className={`p-4 border-b flex flex-wrap gap-4 items-center justify-between ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <div className="relative max-w-sm w-full group">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 group-focus-within:text-[#1EE7FF]' : 'text-[#0A1F44]/30 group-focus-within:text-[#1EE7FF]'}`} />
            <input
              type="text"
              placeholder="Search by name, phone, or role..."
              className={`w-full border rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold transition-all outline-none ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1EE7FF]/50' 
                  : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 text-[#0A1F44] placeholder:text-[#0A1F44]/30 focus:border-[#1EE7FF]'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${
            isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44] hover:bg-[#0A1F44]/5'
          }`}>
            <Filter size={14} /> Filter List
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                <th className="p-6">User Identity</th>
                <th className="p-6">Access Level</th>
                <th className="p-6">Arena Scope</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6">Last Activity</th>
                <th className="p-6 text-right pr-10">Operations</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
              {mockUsers.map((user, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg font-display border transition-all ${
                        isDark 
                          ? 'bg-gradient-to-br from-[#1EE7FF]/20 to-[#22FF88]/20 border-white/10 text-white' 
                          : 'bg-gradient-to-br from-[#1EE7FF]/10 to-[#22FF88]/10 border-[#1EE7FF]/20 text-[#0A1F44]'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-black tracking-tight text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{user.name}</p>
                        <p className="text-[10px] font-bold text-[#1EE7FF] uppercase tracking-widest mt-0.5">{user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest w-max ${
                      isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/70'
                    }`}>
                      <Shield size={12} className={user.role === 'Super Admin' ? 'text-[#FFD600]' : 'text-current opacity-40'} />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
                      <MapPin size={14} className="text-[#22FF88]" />
                      {user.arena}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         user.status === 'Active' 
                           ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' 
                           : 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20'
                       }`}>
                         {user.status}
                       </span>
                    </div>
                  </td>
                  <td className={`p-6 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-[#0A1F44]/20'}`}>
                    {user.lastLogin}
                  </td>
                  <td className="p-6 text-right pr-10">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-[#0A1F44]/5 text-[#0A1F44]/40 hover:text-black'}`}>
                        <Edit2 size={16} />
                      </button>
                      <button className={`p-2 rounded-xl transition-all ${isDark ? 'bg-[#FF4B4B]/10 text-[#FF4B4B]/60 hover:text-[#FF4B4B]' : 'bg-[#FF4B4B]/5 text-[#FF4B4B]/60 hover:text-[#FF4B4B]'}`}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default UserManagement;
