import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Filter, 
  MoreVertical, Shield, MapPin, X, Mail, ArrowRight, ShieldCheck,
  Eye, UserCog, UserMinus, Key, CheckCircle2, AlertCircle, Fingerprint, Activity
} from 'lucide-react';

import { listAdminArenas } from '../../../services/adminOpsApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listAdminUsers, patchAdminUser, createAdminUser } from '../../../services/adminUsersApi';
import { meRequest } from '../../../services/authApi';

const UserManagement = () => {
  const [arenas, setArenas] = useState([]);
  const [users, setUsers] = useState([]);
  const editRoleRef = useRef(null);
  const editArenaRef = useRef(null);
  const editNameRef = useRef(null);
  const editEmailRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUserDetails, setEditingUserDetails] = useState(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ARENA_ADMIN',
    arenaId: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    meRequest().then(res => setMe(res.user)).catch(() => {});
  }, []);

  useEffect(() => {
    if (arenas.length > 0 && !newUserForm.arenaId) {
      setNewUserForm(prev => ({ ...prev, arenaId: arenas[0].id }));
    }
  }, [arenas, newUserForm.arenaId]);

  const loadStaffUsers = useCallback(async () => {
    if (!isApiConfigured() || !getAuthToken()) {
      setUsers([]);
      return;
    }
    try {
      const data = await listAdminUsers({ limit: 100 });
      setUsers(
        (data.users || []).map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          arenaId: u.assignedArenaId || 'all',
          isActive: u.isActive !== false,
          status: u.isActive !== false ? 'Active' : 'Inactive',
        }))
      );
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminArenas();
        if (!cancelled) setArenas((data.arenas || []).map(normalizeListArena));
      } catch {
        if (!cancelled) setArenas([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadStaffUsers();
  }, [loadStaffUsers]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getArenaName = (arenaId) => {
    if (arenaId === 'all') return 'Global Scope';
    return arenas.find((a) => String(a.id) === String(arenaId))?.name || 'Unassigned';
  };

  const filteredUsers = users.filter(user => {
    if (user.role === 'CUSTOMER') return false;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[1000] px-6 py-3 rounded-2xl bg-[#36454F] text-white text-[13px] font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
               {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            </div>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#36454F]">
              <div className="w-10 h-10 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                 <Fingerprint size={24} strokeWidth={2.5} />
              </div>
              Identity Registry
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500 uppercase tracking-widest opacity-60">Manage center-wide operational credentials & access</p>
          </div>
          <button 
            onClick={() => setShowNewUserModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white hover:shadow-xl hover:shadow-[#CE2029]/20 hover:-translate-y-0.5 transition-all text-[11px] font-black uppercase tracking-[0.1em] shadow-sm"
          >
            <UserPlus size={16} strokeWidth={3} /> New Assignment
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-[#36454F] placeholder:text-slate-400 focus:outline-none focus:border-[#CE2029] transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => setShowFilterDrawer(true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
              roleFilter !== 'All' 
                ? 'bg-[#CE2029]/10 border-[#CE2029] text-[#CE2029]' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-[#CE2029]'
            }`}
          >
            <Filter size={14} /> {roleFilter !== 'All' ? roleFilter.replace('_', ' ') : 'Role Filter'}
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:border-[#CE2029]/40">
          <div className="scrollbar-hide">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-[#F8F9FA] text-[#36454F] font-semibold border-b border-slate-100">
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
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#CE2029]/5 border border-[#CE2029]/10 text-[#CE2029] font-black text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#36454F] text-[14px] leading-tight">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                        user.role === 'SUPER_ADMIN' 
                          ? 'bg-[#36454F] border-[#36454F] text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <Shield size={10} className={user.role === 'SUPER_ADMIN' ? 'text-[#CE2029]' : 'text-slate-400'} strokeWidth={3} />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                        <MapPin size={12} className="text-[#CE2029] opacity-60" />
                        {getArenaName(user.arenaId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                         user.isActive 
                           ? 'bg-[#CE2029]/10 text-[#CE2029] border-[#CE2029]/20' 
                           : 'bg-slate-100 text-slate-400 border-slate-200'
                       }`}>
                         {user.isActive ? 'Verified' : 'Suspended'}
                       </span>
                    </td>
                     <td className="px-6 py-4 text-right pr-10">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          className={`p-2 rounded-lg border transition-all ${
                            activeMenu === user.id
                              ? 'bg-[#36454F] border-[#36454F] text-white'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-[#CE2029] hover:border-[#CE2029] shadow-sm'
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
                                    <button
                                      onClick={() => { setViewingUser(user); setActiveMenu(null); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#36454F] transition-colors group"
                                    >
                                      <div className="p-1.5 rounded-md border bg-[#CE2029]/10 border-[#CE2029]/30 text-[#CE2029]">
                                        <Eye size={12} strokeWidth={2.5} />
                                      </div>
                                      View Profile
                                    </button>
                                    <button
                                      onClick={() => { setEditingUserDetails(user); setActiveMenu(null); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#36454F] transition-colors group"
                                    >
                                      <div className="p-1.5 rounded-md border bg-[#CE2029]/10 border-[#CE2029]/30 text-[#CE2029]">
                                        <UserCog size={12} strokeWidth={2.5} />
                                      </div>
                                      Edit Identity
                                    </button>
                                    <button
                                      onClick={() => { showToast(`Key reset link sent to ${user.email}`); setActiveMenu(null); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#36454F] transition-colors group"
                                    >
                                      <div className="p-1.5 rounded-md border bg-[#CE2029]/10 border-[#CE2029]/30 text-[#CE2029]">
                                        <Key size={12} strokeWidth={2.5} />
                                      </div>
                                      Reset Key
                                    </button>
                                    <button
                                      disabled={me?.id === user.id}
                                      onClick={async () => {
                                        setActiveMenu(null);
                                        if (!isApiConfigured() || !getAuthToken()) {
                                          showToast(`User identity ${user.isActive ? 'suspended' : 'activated'}`, 'error');
                                          return;
                                        }
                                        try {
                                          await patchAdminUser(user.id, { isActive: !user.isActive });
                                          await loadStaffUsers();
                                          showToast(`User ${user.isActive ? 'suspended' : 'activated'}`, 'success');
                                        } catch (e) {
                                          showToast(e.message || 'Action failed', 'error');
                                        }
                                      }}
                                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors group ${
                                        me?.id === user.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:text-[#36454F]'
                                      } ${user.isActive ? 'text-slate-600' : 'text-[#CE2029]'}`}
                                    >
                                      <div className={`p-1.5 rounded-md border ${
                                        user.isActive 
                                          ? 'bg-[#FF4B4B]/10 border-[#FF4B4B]/30 text-[#FF4B4B]' 
                                          : 'bg-green-50 border-green-200 text-green-600'
                                      }`}>
                                        {user.isActive ? <UserMinus size={12} strokeWidth={2.5} /> : <CheckCircle2 size={12} strokeWidth={2.5} />}
                                      </div>
                                      {user.isActive ? 'Suspend User' : 'Activate User'}
                                    </button>
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
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-[#36454F] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2">
                    <UserPlus className="text-[#CE2029]" size={24} strokeWidth={3} /> Assignment
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
                      value={newUserForm.name}
                      onChange={e => setNewUserForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email</label>
                    <input 
                      type="email" 
                      placeholder="admin@arena.com"
                      value={newUserForm.email}
                      onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Access Password</label>
                    <div className="relative">
                       <input 
                        type="password" 
                        placeholder="••••••••"
                        value={newUserForm.password}
                        onChange={e => setNewUserForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F] placeholder:text-slate-400"
                      />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Role</label>
                      <select 
                        value={newUserForm.role}
                        onChange={e => setNewUserForm(p => ({ ...p, role: e.target.value }))}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ARENA_ADMIN">Admin</option>
                        <option value="COACH">Coach</option>
                        <option value="RECEPTIONIST">Receptionist</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Arena</label>
                      <select 
                        value={newUserForm.arenaId}
                        onChange={e => setNewUserForm(p => ({ ...p, arenaId: e.target.value }))}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      >
                        <option value="all">Global Scope</option>
                        {arenas.map(arena => (
                          <option key={arena.id} value={arena.id}>{arena.name.split(' ')[0]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                   <ShieldCheck className="text-[#CE2029]" size={24} strokeWidth={2.5} />
                   <div className="flex-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#CE2029]">Privacy & Shield</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Password will be required for the first authentication.</p>
                   </div>
                </div>

                <button 
                  disabled={isCreating}
                  onClick={async () => {
                    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
                      showToast('Please fill all fields', 'error');
                      return;
                    }
                    setIsCreating(true);
                    try {
                      await createAdminUser({
                        name: newUserForm.name,
                        email: newUserForm.email,
                        password: newUserForm.password,
                        role: newUserForm.role,
                        assignedArenaId: newUserForm.arenaId === 'all' ? null : newUserForm.arenaId
                      });
                      await loadStaffUsers();
                      setShowNewUserModal(false);
                      setNewUserForm({ name: '', email: '', password: '', role: 'ARENA_ADMIN', arenaId: arenas[0]?.id || '' });
                      showToast('Assignment initialized');
                    } catch (e) {
                      showToast(e.message || 'Identity initialization failed', 'error');
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  className={`w-full py-4 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white text-[13px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2 ${isCreating ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[#CE2029]/30 hover:shadow-lg hover:-translate-y-0.5'}`}
                >
                  {isCreating ? 'Initializing...' : 'Create Identity'} <ArrowRight size={16} strokeWidth={3} />
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
                  <h3 className="text-xl font-black font-display tracking-tight text-[#36454F] uppercase">Filter Registry</h3>
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
                      { label: 'Super Admin', value: 'SUPER_ADMIN' },
                      { label: 'Admin', value: 'ARENA_ADMIN' },
                      { label: 'Coach', value: 'COACH' },
                    ].map(role => (
                      <button
                        key={role.value}
                        onClick={() => setRoleFilter(role.value)}
                        className={`w-full py-4 px-5 rounded-xl border text-[11px] font-black uppercase tracking-widest text-left transition-all ${
                          roleFilter === role.value 
                            ? 'bg-[#CE2029]/5 border-[#CE2029] text-[#CE2029] shadow-sm' 
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
                  className="w-full py-4 rounded-xl bg-[#36454F] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#CE2029] transition-all shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Identity Modal */}
      <AnimatePresence>
        {editingUserDetails && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingUserDetails(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-[#36454F] shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2">
                       <UserCog className="text-[#CE2029]" size={24} strokeWidth={3} /> Edit Identity
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modify details for {editingUserDetails.name}</p>
                  </div>
                  <button onClick={() => setEditingUserDetails(null)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 bg-white border border-slate-200 shadow-sm" title="Dismiss terminal">
                    <X size={20} strokeWidth={2.5} />
                  </button>
               </div>
               <div className="p-6 space-y-4 md:space-y-6">
                  {/* Name & Email */}
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                      <input 
                        ref={editNameRef}
                        type="text" 
                        defaultValue={editingUserDetails.name}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Registry Email</label>
                      <input 
                        ref={editEmailRef}
                        type="email" 
                        defaultValue={editingUserDetails.email}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assigned Role</label>
                      <select
                        ref={editRoleRef}
                        defaultValue={editingUserDetails.role}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ARENA_ADMIN">Admin</option>
                        <option value="RECEPTIONIST">Receptionist</option>
                        <option value="COACH">Coach</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Operational Scope</label>
                      <select
                        ref={editArenaRef}
                        defaultValue={editingUserDetails.arenaId}
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      >
                        <option value="all">Global</option>
                        {arenas.map((arena) => (
                          <option key={arena.id} value={arena.id}>
                            {arena.name.split(' ')[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingUserDetails) return;
                      const name = editNameRef.current?.value;
                      const email = editEmailRef.current?.value;
                      const role = editRoleRef.current?.value;
                      const arenaRaw = editArenaRef.current?.value;
                      const assignedArenaId = arenaRaw === 'all' || !arenaRaw ? null : arenaRaw;

                      try {
                        await patchAdminUser(editingUserDetails.id, {
                          name,
                          email,
                          role,
                          assignedArenaId,
                        });
                        await loadStaffUsers();
                        setEditingUserDetails(null);
                        showToast('Identity updated successfully');
                      } catch (e) {
                        showToast(e.message || 'Update failed', 'error');
                      }
                    }}
                    className="w-full py-4 rounded-xl bg-[#CE2029] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                  >
                    Save Identity Changes
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Profile Modal (Maximum Compaction) */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingUser(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }} 
              className="relative w-full max-w-[420px] rounded-[32px] bg-white text-[#36454F] shadow-2xl overflow-hidden border border-white/20 p-6 md:p-7"
            >
               {/* Background Watermark */}
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Fingerprint size={160} strokeWidth={1} />
               </div>

               {/* Header Block - Compact Horizontal */}
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-[#CE2029] flex items-center justify-center text-xl font-black text-white shadow-lg shadow-[#CE2029]/20">
                        {viewingUser.name.charAt(0)}
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-xl font-black tracking-tight text-[#36454F] leading-none mb-1.5 truncate">{viewingUser.name}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black uppercase tracking-widest text-[#CE2029]">{viewingUser.role.replace('_', ' ')}</span>
                           <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <Activity size={8} strokeWidth={3} />
                              <span className="text-[7px] font-black uppercase tracking-widest">LIVE</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => setViewingUser(null)} 
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-100 hover:bg-[#CE2029] hover:text-white transition-all shadow-sm"
                  >
                      <X size={16} strokeWidth={3} />
                  </button>
               </div>
               
               {/* Core Information Grid (1x2 to save space) */}
               <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-[#CE2029]/30 hover:shadow-sm">
                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#CE2029] mb-3">
                        <MapPin size={16} strokeWidth={2.5} />
                     </div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Arena Scope</p>
                     <p className="font-black text-[12px] text-[#36454F] truncate">{getArenaName(viewingUser.arenaId)}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-[#CE2029]/30 hover:shadow-sm">
                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#CE2029] mb-3">
                        <Mail size={16} strokeWidth={2.5} />
                     </div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Registry Email</p>
                     <p className="font-black text-[12px] text-[#36454F] truncate">{viewingUser.email}</p>
                  </div>
               </div>
               
               {/* Actions Bar - Compact */}
               <div className="flex gap-2 relative z-10">
                  <button className="flex-1 py-3 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#CE2029]/20 hover:-translate-y-0.5 transition-all"> 
                     Contact Identity
                  </button>
                  <button className="flex-[0.6] py-3 rounded-xl bg-[#36454F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#CE2029] transition-all"> 
                     Audit Log
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
