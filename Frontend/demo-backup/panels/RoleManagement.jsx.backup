import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit2, Trash2, CheckSquare, Square, X, Info, Settings, Users } from 'lucide-react';

const INITIAL_ROLES = [
  { id: 1, name: 'Super Admin', users: 2, description: 'Full system engineering access', isSystem: true },
  { id: 2, name: 'Arena Admin', users: 15, description: 'Regional facility operations', isSystem: false },
  { id: 3, name: 'Receptionist', users: 45, description: 'Customer check-ins & POS', isSystem: false },
  { id: 4, name: 'Analyst', users: 3, description: 'Financial audit & reporting', isSystem: false }
];

const MODULES = ['Identity', 'Arenas', 'Inventory', 'Finance', 'Schedules', 'Bookings', 'Coaching', 'Retail POS'];

const RoleManagement = () => {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const [permissions, setPermissions] = useState(() => {
    const initial = {};
    INITIAL_ROLES.forEach(role => {
      initial[role.id] = {};
      MODULES.forEach(module => {
        const isSuper = role.id === 1;
        initial[role.id][module] = { view: isSuper, create: isSuper, edit: isSuper, delete: isSuper };
      });
    });
    return initial;
  });

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;
    const id = Math.max(...roles.map(r => r.id)) + 1;
    const roleToAdd = { id, name: newRole.name, description: newRole.description || 'Custom role', users: 0, isSystem: false };
    setRoles([...roles, roleToAdd]);
    setPermissions(prev => ({
      ...prev,
      [id]: MODULES.reduce((acc, mod) => ({ ...acc, [mod]: { view: false, create: false, edit: false, delete: false } }), {})
    }));
    setIsModalOpen(false);
    setNewRole({ name: '', description: '' });
    setSelectedRole(roleToAdd);
  };

  const togglePermission = (roleId, module, action) => {
    if (roleId === 1) return;
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [module]: { ...prev[roleId][module], [action]: !prev[roleId][module][action] }
      }
    }));
  };

  const handleDeleteRole = (id) => {
    if (id === 1) return;
    const updatedRoles = roles.filter(r => r.id !== id);
    setRoles(updatedRoles);
    if (selectedRole.id === id) setSelectedRole(updatedRoles[0]);
  };

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans text-[#36454F]">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#36454F]">
              <Shield className="text-[#CE2029] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Authorization Hub
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Define RBAC (Role-Based Access Control) and security boundaries.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#CE2029]/20"
          >
            <Plus size={16} strokeWidth={3} /> Define Role
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles Navigation */}
          <div className="lg:col-span-1 space-y-4">
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-24 overflow-hidden group hover:border-[#CE2029]/40 transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] mb-4 px-1 flex items-center gap-2">
                   <Settings size={12} strokeWidth={2.5} /> Roles Directory
                </p>
                <div className="space-y-2 flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`text-left p-4 rounded-xl transition-all border w-full flex-shrink-0 lg:flex-shrink-1 min-w-[160px] lg:min-w-0 flex flex-col justify-between h-24 lg:h-auto ${
                        selectedRole.id === role.id 
                          ? 'bg-slate-50 border-[#CE2029] shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-black text-[13px] tracking-tight ${selectedRole.id === role.id ? 'text-[#36454F]' : 'text-slate-500'}`}>
                            {role.name}
                          </h3>
                          <p className={`text-[10px] font-bold mt-0.5 uppercase tracking-widest leading-none ${selectedRole.id === role.id ? 'text-[#CE2029]' : 'text-slate-300'}`}>
                             {role.users} Members
                          </p>
                        </div>
                        {role.isSystem && (
                          <Shield size={14} className="text-[#CE2029] opacity-30" strokeWidth={2.5} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Matrix Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-10 transition-all hover:border-[#CE2029]/40">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight text-[#36454F]">
                    Permission Matrix: <span className="text-[#CE2029] font-sans">{selectedRole.name}</span>
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-1 italic">{selectedRole.description}</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-[#36454F] transition-all flex items-center justify-center gap-2">
                    <Edit2 size={14} strokeWidth={2.5} /> Rename
                  </button>
                  {!selectedRole.isSystem && (
                    <button 
                      onClick={() => handleDeleteRole(selectedRole.id)}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-red-100 bg-red-50 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} strokeWidth={2.5} /> Purge Role
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest border-b border-slate-100 text-[#36454F] bg-slate-50">
                        <th className="px-8 py-6">Operational Module</th>
                        <th className="px-8 py-6 text-center">Root</th>
                        <th className="px-8 py-6 text-center">Create</th>
                        <th className="px-8 py-6 text-center">Modify</th>
                        <th className="px-8 py-6 text-center">Drop</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MODULES.map((module) => (
                        <tr key={module} className="group hover:bg-white transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-[#CE2029]/40 group-hover:bg-[#CE2029] transition-all" />
                              <span className="text-sm font-black text-[#36454F] tracking-tight">{module} Management</span>
                            </div>
                          </td>
                          {['view', 'create', 'edit', 'delete'].map((action) => {
                            const isSuper = selectedRole.id === 1;
                            const hasAccess = permissions[selectedRole.id]?.[module]?.[action];
                            return (
                              <td key={action} className="px-8 py-6 text-center">
                                <motion.button 
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => togglePermission(selectedRole.id, module, action)}
                                  disabled={isSuper} 
                                  className={`transition-all ${isSuper ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:opacity-60'}`}
                                >
                                  {hasAccess ? (
                                    <CheckSquare size={22} className="text-[#CE2029] inline-block" strokeWidth={2.5} />
                                  ) : (
                                    <Square size={22} className="text-slate-200 inline-block" strokeWidth={2} />
                                  )}
                                </motion.button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-8 p-5 rounded-2xl flex items-center gap-4 bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#CE2029] group">
                  <Info size={18} strokeWidth={2.5} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Global Policy Enforcement: <span className="text-[#36454F]">Authorization updates propagate across all network instances instantly.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Role Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white text-[#36454F] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Shield className="text-[#CE2029]" size={24} strokeWidth={3} /> Role Initialization
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Define new authority parameters</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-300 bg-white border border-slate-200 shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Role Designation</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      placeholder="e.g. Content Moderator"
                      className="w-full py-4 px-6 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white transition-all text-[#36454F]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Operational Mandate</label>
                    <textarea
                      rows={3}
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      placeholder="Briefly describe the responsibilities of this role..."
                      className="w-full py-4 px-6 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white transition-all text-[#36454F] resize-none"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#CE2029] shadow-sm">
                       <Users size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment Scope</p>
                       <p className="text-[11px] font-bold text-slate-500 mt-1 leading-snug">New roles start with zero permissions by default for safety.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateRole}
                  disabled={!newRole.name.trim()}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all font-black text-[13px] uppercase tracking-widest shadow-lg ${
                    newRole.name.trim() 
                      ? 'bg-[#CE2029] border border-[#CE2029] text-white hover:shadow-[#CE2029]/30 hover:-translate-y-0.5' 
                      : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Establish Privilege Level <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagement;
