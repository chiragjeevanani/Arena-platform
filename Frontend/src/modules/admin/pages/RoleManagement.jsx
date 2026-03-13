import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit2, Trash2, CheckSquare, Square, X, Info, Settings, Users } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_ROLES = [
  { id: 1, name: 'Super Admin', users: 2, description: 'Full system access', isSystem: true },
  { id: 2, name: 'Arena Admin', users: 15, description: 'Manage specific arenas', isSystem: false },
  { id: 3, name: 'Reception Staff', users: 45, description: 'Handle bookings & POS', isSystem: false },
  { id: 4, name: 'Accountant', users: 3, description: 'Financial reports only', isSystem: false }
];

const MODULES = ['Users', 'Arenas', 'Courts', 'Slots', 'Bookings', 'Coaching', 'Events', 'Inventory', 'Retail POS', 'Reports'];

const RoleManagement = () => {
  const { isDark } = useTheme();
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  // Permissions state: roleId -> module -> {view, create, edit, delete}
  const [permissions, setPermissions] = useState(() => {
    const initial = {};
    INITIAL_ROLES.forEach(role => {
      initial[role.id] = {};
      MODULES.forEach(module => {
        const isSuper = role.id === 1;
        initial[role.id][module] = {
          view: isSuper,
          create: isSuper,
          edit: isSuper,
          delete: isSuper
        };
      });
    });
    return initial;
  });

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;

    const id = Math.max(...roles.map(r => r.id)) + 1;
    const roleToAdd = {
      id,
      name: newRole.name,
      description: newRole.description || 'Custom defined role',
      users: 0,
      isSystem: false
    };

    setRoles([...roles, roleToAdd]);
    
    // Initialize permissions for new role
    setPermissions(prev => ({
      ...prev,
      [id]: MODULES.reduce((acc, mod) => ({
        ...acc,
        [mod]: { view: false, create: false, edit: false, delete: false }
      }), {})
    }));

    setIsModalOpen(false);
    setNewRole({ name: '', description: '' });
    setSelectedRole(roleToAdd);
  };

  const togglePermission = (roleId, module, action) => {
    if (roleId === 1) return; // Super Admin immutable

    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [module]: {
          ...prev[roleId][module],
          [action]: !prev[roleId][module][action]
        }
      }
    }));
  };

  const handleDeleteRole = (id) => {
    if (id === 1) return;
    const updatedRoles = roles.filter(r => r.id !== id);
    setRoles(updatedRoles);
    if (selectedRole.id === id) {
      setSelectedRole(updatedRoles[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Shield className="text-[#22FF88]" /> Security & Permissions
          </h2>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Configure Role-Based Access Control (RBAC) levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
        >
          <Plus size={16} /> New Security Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className={`rounded-3xl p-4 flex flex-col gap-2 border h-fit sticky top-24 ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest px-4 mb-2 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Active Roles</p>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`text-left p-4 rounded-2xl transition-all border group relative overflow-hidden ${
                selectedRole.id === role.id 
                  ? 'bg-gradient-to-r from-[#22FF88]/20 to-transparent border-[#22FF88]/30 border-l-4 border-l-[#22FF88]' 
                  : `${isDark ? 'bg-white/2 border-transparent hover:bg-white/5' : 'bg-[#0A1F44]/2 border-transparent hover:bg-[#0A1F44]/5'} border-l-4 border-l-transparent`
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-black tracking-tight text-sm ${selectedRole.id === role.id ? 'text-[#22FF88]' : isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  {role.name}
                </h3>
                {role.isSystem && (
                  <Settings size={12} className="opacity-20" />
                )}
              </div>
              <p className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest truncate">{role.description}</p>
              <div className={`text-[9px] uppercase font-black mt-3 tracking-widest flex items-center gap-2 ${selectedRole.id === role.id ? 'text-[#1EE7FF]' : 'text-white/20'}`}>
                <Users size={10} /> {role.users} Users
              </div>
            </button>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className={`lg:col-span-3 rounded-[2.5rem] border p-6 lg:p-10 ${isDark ? 'bg-[#0A1F44]/50 border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-[#0A1F44]/10 shadow-2xl shadow-blue-900/5'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h3 className={`font-black font-display uppercase tracking-[0.2em] text-sm flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                Access Matrix: <span className="text-[#22FF88] italic">{selectedRole.name}</span>
              </h3>
              <p className="text-xs text-white/20 mt-1 font-bold italic">{selectedRole.description}</p>
            </div>
            
            <div className="flex gap-3">
              <button className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isDark ? 'border-white/10 text-white/60 hover:text-white hover:bg-white/5' : 'border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44] hover:bg-[#0A1F44]/5'}`}>
                <Edit2 size={12} /> Rename
              </button>
              {!selectedRole.isSystem && (
                <button 
                  onClick={() => handleDeleteRole(selectedRole.id)}
                  className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:bg-[#FF4B4B] hover:text-white hover:border-transparent ${isDark ? 'border-[#FF4B4B]/30 text-[#FF4B4B]' : 'border-[#FF4B4B]/30 text-[#FF4B4B]'}`}
                >
                  <Trash2 size={12} /> Purge Role
                </button>
              )}
            </div>
          </div>

          <div className={`overflow-hidden rounded-[2rem] border ${isDark ? 'border-white/5 bg-black/20' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2 shadow-inner'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className={`text-[10px] font-black uppercase tracking-[0.3em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                    <th className="p-8">System Module</th>
                    <th className="p-8 text-center">View</th>
                    <th className="p-8 text-center">Create</th>
                    <th className="p-8 text-center">Update</th>
                    <th className="p-8 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
                  {MODULES.map((module) => (
                    <tr key={module} className="group hover:bg-white/[0.03] transition-colors">
                      <td className={`p-8`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#22FF88]/20' : 'bg-[#22FF88]/40'}`} />
                          <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{module}</span>
                        </div>
                      </td>
                      {['view', 'create', 'edit', 'delete'].map((action) => {
                        const isSuper = selectedRole.id === 1;
                        const hasAccess = permissions[selectedRole.id]?.[module]?.[action];
                        return (
                          <td key={action} className="p-8 text-center">
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => togglePermission(selectedRole.id, module, action)}
                              disabled={isSuper} 
                              className={`transition-all ${isSuper ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                            >
                              {hasAccess ? (
                                <CheckSquare size={22} className="text-[#22FF88] inline-block shadow-[0_0_15px_rgba(34,255,136,0.2)]" />
                              ) : (
                                <Square size={22} className={`${isDark ? 'text-white/10' : 'text-[#0A1F44]/10'} inline-block`} />
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
          
          <div className={`mt-8 p-6 rounded-2xl flex items-center gap-4 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
            <Info size={16} className="text-[#1EE7FF]" />
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
              Changes to security roles are applied instantly across all assigned user accounts.
            </p>
          </div>
        </div>
      </div>

      {/* New Role Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#08142B]/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden flex flex-col max-h-[90vh] ${isDark ? 'bg-[#0A1F44] border-white/10' : 'bg-white border-[#0A1F44]/10 shadow-[0_30px_100px_rgba(0,0,0,0.2)]'}`}
            >
              {/* Internal Scrollable Container */}
              <div className="overflow-y-auto p-8 sm:p-10 custom-scrollbar">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors z-10"
                >
                  <X size={24} />
                </button>

                <div className="mb-10">
                  <div className="w-16 h-16 rounded-[2rem] bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88] mb-6">
                    <Shield size={32} />
                  </div>
                  <h3 className={`text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>New Security Role</h3>
                  <p className={`text-sm mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Define access boundaries for specific staff members.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Role Identifier</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      placeholder="e.g. Court Moderator"
                      className={`w-full py-4 px-6 rounded-2xl text-sm font-black outline-none border transition-all ${
                        isDark 
                          ? 'bg-white/5 border-white/10 focus:border-[#22FF88] text-white placeholder:text-white/10' 
                          : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44] placeholder:text-[#0A1F44]/30'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Role Briefing</label>
                    <textarea
                      rows={3}
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      placeholder="What will this role handle?"
                      className={`w-full py-4 px-6 rounded-2xl text-sm font-black outline-none border transition-all resize-none ${
                        isDark 
                          ? 'bg-white/5 border-white/10 focus:border-[#22FF88] text-white placeholder:text-white/10' 
                          : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44] placeholder:text-[#0A1F44]/30'
                      }`}
                    />
                  </div>

                  <div className="pt-4 pb-2">
                    <button
                      onClick={handleCreateRole}
                      disabled={!newRole.name.trim()}
                      className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl ${
                        newRole.name.trim() 
                          ? 'bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-[1.02] shadow-[#22FF88]/20' 
                          : isDark ? 'bg-white/5 text-white/5 cursor-not-allowed border border-white/5' : 'bg-black/5 text-black/10 cursor-not-allowed border border-black/5'
                      }`}
                    >
                      Establish Security Role
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagement;
