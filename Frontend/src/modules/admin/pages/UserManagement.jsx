import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Filter, 
  MoreVertical, Shield, MapPin, X, Mail, ArrowRight, ShieldCheck,
  Eye, UserCog, UserMinus, Key
} from 'lucide-react';

import { MOCK_DB } from '../../../data/mockDatabase';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');

  const getArenaName = (arenaId) => {
    if (arenaId === 'all') return 'Global Scope';
    return MOCK_DB.arenas.find(a => a.id === arenaId)?.name || 'Unassigned';
  };

  const filteredUsers = MOCK_DB.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
              <Users className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Identity Management
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Assign roles and manage facility access permissions.</p>
          </div>
          <button 
            onClick={() => setShowNewUserModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
          >
            <UserPlus size={16} strokeWidth={3} /> New Assignment
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-[#1a2b3c] placeholder:text-slate-400 focus:outline-none focus:border-[#eb483f] transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => setShowFilterDrawer(true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
              roleFilter !== 'All' 
                ? 'bg-[#eb483f]/10 border-[#eb483f] text-[#eb483f]' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-[#eb483f]'
            }`}
          >
            <Filter size={14} /> {roleFilter !== 'All' ? roleFilter.replace('_', ' ') : 'Role Filter'}
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#eb483f]/40">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-[#F8F9FA] text-[#1a2b3c] font-semibold border-b border-slate-100">
                <tr className="text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Identity Detail</th>
                  <th className="px-6 py-4">Authentication</th>
                  <th className="px-6 py-4">Operational Scope</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right pr-10">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={user.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                     <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#eb483f]/5 border border-[#eb483f]/10 text-[#eb483f] font-black text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1a2b3c] text-[14px] leading-tight">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <Shield size={10} className={user.role === 'SUPER_ADMIN' ? 'text-[#eb483f]' : 'text-slate-400'} strokeWidth={3} />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                        <MapPin size={12} className="text-[#eb483f] opacity-60" />
                        {getArenaName(user.arenaId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                         user.status === 'Active' 
                           ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' 
                           : 'bg-slate-100 text-slate-400 border-slate-200'
                       }`}>
                         {user.status === 'Active' ? 'Verified' : 'Inactive'}
                       </span>
                    </td>
                     <td className="px-6 py-4 text-right pr-10">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          className={`p-2 rounded-lg border transition-all ${
                            activeMenu === user.id
                              ? 'bg-[#1a2b3c] border-[#1a2b3c] text-white'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-[#eb483f] hover:border-[#eb483f] shadow-sm'
                          }`}
                        >
                          <MoreVertical size={16} strokeWidth={2.5} />
                        </button>

                        <AnimatePresence>
                          {activeMenu === user.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className={`absolute right-0 ${idx >= filteredUsers.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-xl z-20`}
                              >
                                 <div className="space-y-1">
                                  {[
                                    { label: 'View Profile', icon: Eye, color: '#eb483f' },
                                    { label: 'Edit Rules', icon: UserCog, color: '#eb483f' },
                                    { label: 'Reset Key', icon: Key, color: '#eb483f' },
                                    { label: 'Suspend User', icon: UserMinus, color: '#FF4B4B' },
                                  ].map((item, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setActiveMenu(null)}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1a2b3c] transition-colors group"
                                    >
                                      <div className="p-1.5 rounded-md border" style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}30`, color: item.color }}>
                                        <item.icon size={12} strokeWidth={2.5} />
                                      </div>
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delegate Modal (New User) */}
      <AnimatePresence>
        {showNewUserModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewUserModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2">
                    <UserPlus className="text-[#eb483f]" size={24} strokeWidth={3} /> Assignment
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize user credentials</p>
                </div>
                <button 
                  onClick={() => setShowNewUserModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Name</label>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email</label>
                    <input 
                      type="email" 
                      placeholder="admin@arena.com"
                      className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Role</label>
                      <select className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                        <option value="SUPER_ADMIN">Admin</option>
                        <option value="ARENA_ADMIN">Arena Manager</option>
                        <option value="COACH">Coach</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Arena</label>
                      <select className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                        {MOCK_DB.arenas.map(arena => (
                          <option key={arena.id} value={arena.id}>{arena.name.split(' ')[0]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                   <ShieldCheck className="text-[#eb483f]" size={24} strokeWidth={2.5} />
                   <div className="flex-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#eb483f]">Privacy & Shield</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Automated 2FA enforcement required for assignment.</p>
                   </div>
                   <div className="w-10 h-6 bg-[#eb483f] rounded-full relative shadow-sm">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </div>

                <button 
                  onClick={() => setShowNewUserModal(false)}
                  className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#eb483f]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  Create Identity <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full shadow-2xl bg-white border-l border-slate-100 flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight text-[#1a2b3c] uppercase">Filter Registry</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Refine user perspective</p>
                </div>
                <button 
                  onClick={() => setShowFilterDrawer(false)} 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100 text-slate-400 bg-white border border-slate-200 shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-8 flex-1 space-y-8 overflow-y-auto">
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Authorization Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'All', value: 'All' },
                      { label: 'Admin', value: 'SUPER_ADMIN' },
                      { label: 'Arena Manager', value: 'ARENA_ADMIN' },
                      { label: 'Coach', value: 'COACH' },
                      { label: 'Customer', value: 'CUSTOMER' },
                    ].map(role => (
                      <button
                        key={role.value}
                        onClick={() => setRoleFilter(role.value)}
                        className={`w-full py-4 px-5 rounded-xl border text-[11px] font-black uppercase tracking-widest text-left transition-all ${
                          roleFilter === role.value 
                            ? 'bg-[#eb483f]/5 border-[#eb483f] text-[#eb483f] shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => { setRoleFilter('All'); setShowFilterDrawer(false); }}
                  className="w-full py-4 rounded-xl bg-[#1a2b3c] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#eb483f] transition-all shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
