import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Filter, 
  MoreVertical, Edit2, Shield, MapPin, CheckCircle, XCircle, X, Mail, ArrowRight, ShieldCheck, Database,
  Eye, UserCog, UserMinus, Key, Wand2
} from 'lucide-react';

import { useTheme } from '../../user/context/ThemeContext';
import { MOCK_DB } from '../../../data/mockDatabase';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const { isDark } = useTheme();

  const getArenaName = (arenaId) => {
    if (arenaId === 'all') return 'Master Scope (All)';
    return MOCK_DB.arenas.find(a => a.id === arenaId)?.name || 'Unassigned';
  };

  const filteredUsers = MOCK_DB.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Users className="text-[#1EE7FF]" /> User Registry
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium italic">Active User Management: Cross-Arena Admin Support Enabled</p>
        </div>
        <button 
          onClick={() => setShowNewUserModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1EE7FF] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#1EE7FF]/20"
        >
          <UserPlus size={16} /> Assign New Admin
        </button>
      </div>

      <div className={`rounded-3xl border overflow-hidden flex flex-col ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'}`}>
        {/* Table Toolbar */}
        <div className={`p-4 border-b flex flex-wrap gap-4 items-center justify-between ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <div className="relative max-w-sm w-full group">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 group-focus-within:text-[#1EE7FF]' : 'text-[#0A1F44]/30 group-focus-within:text-[#1EE7FF]'}`} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              className={`w-full border rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold transition-all outline-none ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1EE7FF]/50' 
                  : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 text-[#0A1F44] placeholder:text-[#0A1F44]/30 focus:border-[#1EE7FF]'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilterDrawer(true)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44] hover:bg-[#0A1F44]/5'
          } ${roleFilter !== 'All' ? 'border-[#1EE7FF] text-[#1EE7FF]' : ''}`}>
            <Filter size={14} /> Filters {roleFilter !== 'All' && `(${roleFilter})`}
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                <th className="p-6">User Identity</th>
                <th className="p-6">Access Level</th>
                <th className="p-6">Arena Assignment</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right pr-10">Operations</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
              {filteredUsers.map((user, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  className={`group hover:bg-white/[0.02] transition-colors ${!isDark && 'hover:bg-black/[0.02]'}`}
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
                        <p className="text-[10px] font-bold text-[#1EE7FF] uppercase tracking-widest mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest w-max ${
                      isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/70'
                    }`}>
                      <Shield size={12} className={user.role === 'SUPER_ADMIN' ? 'text-[#FFD600]' : 'text-current opacity-40'} />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
                      <MapPin size={14} className="text-[#22FF88]" />
                      {getArenaName(user.arenaId)}
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
                  <td className="p-6 text-right pr-10">
                    <div className="flex justify-end gap-2 relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className={`p-2.5 rounded-xl transition-all border ${
                          activeMenu === user.id
                            ? 'bg-[#1EE7FF] border-[#1EE7FF] text-[#0A1F44]'
                            : isDark 
                              ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/10' 
                              : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/40 hover:text-black hover:border-[#0A1F44]/20'
                        }`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className={`absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl border z-20 shadow-2xl backdrop-blur-xl ${
                                isDark ? 'bg-[#0A1F44]/90 border-white/10 shadow-black' : 'bg-white/90 border-[#0A1F44]/10 shadow-blue-900/10'
                              }`}
                            >
                              <div className="space-y-1">
                                {[
                                  { label: 'View Profile', icon: Eye, color: '#1EE7FF' },
                                  { label: 'Edit Permissions', icon: UserCog, color: '#22FF88' },
                                  { label: 'Reset Credentials', icon: Key, color: '#FFD600' },
                                  { label: 'Impersonate User', icon: Wand2, color: '#A855F7' },
                                  { label: 'Deactivate Account', icon: UserMinus, color: '#FF4B4B' },
                                ].map((item, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setActiveMenu(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                      isDark ? 'hover:bg-white/5 text-white/60 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F44]'
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-lg border transition-colors`} style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}20`, color: item.color }}>
                                      <item.icon size={12} />
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

      {/* New User Modal */}
      <AnimatePresence>
        {showNewUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewUserModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <UserPlus className="text-[#1EE7FF]" /> Delegate Authority
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Register hierarchy-based administrative access</p>
                </div>
                <button 
                  onClick={() => setShowNewUserModal(false)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Personal Identity</label>
                    <div className="relative">
                      <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#1EE7FF] group-focus-within:opacity-100 transition-all font-black text-[13px]" />
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Electronic Mail Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#1EE7FF] group-focus-within:opacity-100 transition-all font-black text-[13px]" />
                      <input 
                        type="email" 
                        placeholder="admin@arena.com"
                        className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Defined Role</label>
                      <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`}>
                        <option>ARENA_ADMIN</option>
                        <option>STAFF</option>
                        <option>COACH</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Arena Scope</label>
                      <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`}>
                        {MOCK_DB.arenas.map(arena => (
                          <option key={arena.id} value={arena.id}>{arena.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border border-dashed flex items-center gap-4 ${isDark ? 'bg-[#1EE7FF]/5 border-[#1EE7FF]/20' : 'bg-[#1EE7FF]/5 border-[#1EE7FF]/30'}`}>
                   <ShieldCheck className="text-[#1EE7FF]" size={20} />
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1EE7FF]">Security Protocol</p>
                      <p className="text-xs font-bold mt-1 opacity-40">Require 2FA upon initial authentication</p>
                   </div>
                   <div className="w-10 h-6 bg-[#1EE7FF] rounded-full relative shadow-lg shadow-[#1EE7FF]/20">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-[#0A1F44] rounded-full" />
                   </div>
                </div>

                <button 
                  onClick={() => setShowNewUserModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#1EE7FF] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#1EE7FF]/20 flex items-center justify-center gap-2"
                >
                  Confirm Assignment <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative w-full max-w-sm h-full shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-[#0A1F44] border-l border-white/10' : 'bg-white border-l border-black/10'}`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight text-[#1EE7FF]">Filter Registry</h3>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">Refine user management view</p>
                </div>
                <button onClick={() => setShowFilterDrawer(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-black/5 text-black/40'}`}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 flex-1 space-y-8 overflow-y-auto">
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4 block">Access Level Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['All', 'SUPER_ADMIN', 'ARENA_ADMIN', 'STAFF', 'COACH'].map(role => (
                      <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`w-full py-4 px-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-left transition-all ${
                          roleFilter === role 
                            ? 'bg-[#1EE7FF]/10 border-[#1EE7FF] text-[#1EE7FF]' 
                            : isDark ? 'bg-white/5 border-white/5 text-white/40 hover:border-white/20' : 'bg-black/5 border-black/5 text-[#0A1F44]/40 hover:border-black/20'
                        }`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-inherit">
                <button 
                  onClick={() => { setRoleFilter('All'); setShowFilterDrawer(false); }}
                  className="w-full py-4 rounded-2xl bg-[#1EE7FF] text-[#0A1F44] text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#1EE7FF]/20"
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
