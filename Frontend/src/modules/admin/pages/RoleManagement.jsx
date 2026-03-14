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
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Shield className="text-[#22FF88] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> RBAC
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Access hub.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#22FF88]/20"
        >
          <Plus size={14} /> Assign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Roles List */}
        <div className={`rounded-xl md:rounded-3xl p-1.5 md:p-4 flex h-auto lg:h-fit lg:flex-col gap-1.5 border overflow-x-auto lg:overflow-visible sticky top-24 scrollbar-hide ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <p className={`hidden lg:block text-[10px] font-black uppercase tracking-widest px-4 mb-2 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Identity</p>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`text-left p-2.5 md:p-4 min-w-[110px] md:min-w-0 rounded-lg md:rounded-2xl transition-all border group relative overflow-hidden flex-shrink-0 ${
                selectedRole.id === role.id 
                  ? 'bg-gradient-to-r from-[#22FF88]/10 to-transparent border-[#22FF88]/30 border-l-4 border-l-[#22FF88]' 
                  : `${isDark ? 'bg-white/5 border-transparent' : 'bg-[#0A1F44]/2 border-transparent'} border-l-4 border-l-transparent`
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-black tracking-tight text-[10px] md:text-sm ${selectedRole.id === role.id ? 'text-[#22FF88]' : isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  {role.name.split(' ')[0]}
                </h3>
                {role.isSystem && (
                  <Settings size={10} className="opacity-20 md:w-[12px] md:h-[12px]" />
                )}
              </div>
              <p className={`text-[7px] font-bold text-white/10 mt-1 uppercase tracking-widest truncate ${selectedRole.id === role.id && 'text-white/30'}`}>{role.description.split(' ')[0]}</p>
              <div className={`text-[7px] md:text-[8px] uppercase font-black mt-2 md:mt-3 tracking-widest flex items-center gap-1.5 ${selectedRole.id === role.id ? 'text-[#1EE7FF]' : 'text-white/10'}`}>
                <Users size={8} /> {role.users}
              </div>
            </button>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className={`lg:col-span-3 rounded-xl md:rounded-[2.5rem] border p-3 md:p-10 ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-6 mb-4 md:mb-10">
            <div>
              <h3 className={`font-black font-display uppercase tracking-widest text-[9px] md:text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                Matrix: <span className="text-[#22FF88] italic">{selectedRole.name}</span>
              </h3>
              <p className="text-[8px] md:text-xs text-white/20 mt-0.5 font-bold italic">{selectedRole.description}</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg md:rounded-xl border text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${isDark ? 'border-white/5 text-white/20 hover:text-white' : 'border-[#0A1F44]/10 text-[#0A1F0B]/40 hover:text-[#0A1F0B]'}`}>
                <Edit2 size={10} /> Name
              </button>
              {!selectedRole.isSystem && (
                <button 
                  onClick={() => handleDeleteRole(selectedRole.id)}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg md:rounded-xl border text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${isDark ? 'border-[#FF4B4B]/30 text-[#FF4B4B]' : 'border-[#FF4B4B]/20 text-[#FF4B4B]'}`}
                >
                  <Trash2 size={10} /> Purge
                </button>
              )}
            </div>
          </div>

          <div className={`overflow-hidden rounded-xl md:rounded-[2rem] border ${isDark ? 'border-white/5 bg-black/20' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2 shadow-inner'}`}>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                    <th className="p-3 md:p-8">Module</th>
                    <th className="p-3 md:p-8 text-center uppercase">Root</th>
                    <th className="p-3 md:p-8 text-center uppercase">Add</th>
                    <th className="p-3 md:p-8 text-center uppercase">Mod</th>
                    <th className="p-3 md:p-8 text-center uppercase">Drop</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#0A1F44]/5'}`}>
                  {MODULES.map((module) => (
                    <tr key={module} className="group hover:bg-white/[0.02] transition-colors">
                      <td className={`p-3 md:p-8`}>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#22FF88]/20' : 'bg-[#22FF88]/40'}`} />
                          <span className={`text-[10px] md:text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{module}</span>
                        </div>
                      </td>
                      {['view', 'create', 'edit', 'delete'].map((action) => {
                        const isSuper = selectedRole.id === 1;
                        const hasAccess = permissions[selectedRole.id]?.[module]?.[action];
                        return (
                          <td key={action} className="p-3 md:p-8 text-center">
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => togglePermission(selectedRole.id, module, action)}
                              disabled={isSuper} 
                              className={`transition-all ${isSuper ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                            >
                              {hasAccess ? (
                                <CheckSquare size={14} className="md:w-[22px] md:h-[22px] text-[#22FF88] inline-block" />
                              ) : (
                                <Square size={14} className={`md:w-[22px] md:h-[22px] ${isDark ? 'text-white/5' : 'text-[#0A1F44]/5'} inline-block`} />
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
          
          <div className={`mt-4 md:mt-8 p-3 md:p-6 rounded-lg md:rounded-2xl flex items-center gap-3 md:gap-4 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
            <Info size={12} className="text-[#1EE7FF] shrink-0 opacity-40" />
            <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>
              Changes are applied instantly to the network.
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
              className={`relative w-full max-w-lg rounded-3xl md:rounded-[2.5rem] border overflow-hidden flex flex-col max-h-[90vh] ${isDark ? 'bg-[#0A1F44] border-white/10' : 'bg-white border-[#0A1F44]/10 shadow-[0_30px_100px_rgba(0,0,0,0.2)]'}`}
            >
              {/* Internal Scrollable Container */}
              <div className="overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-10"
                >
                  <X size={20} className="md:w-[24px] md:h-[24px]" />
                </button>

                <div className="mb-6 md:mb-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2rem] bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88] mb-4 md:mb-6">
                    <Shield size={24} className="md:w-[32px] md:h-[32px]" />
                  </div>
                  <h3 className={`text-xl md:text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>New Role</h3>
                  <p className={`text-[11px] md:text-sm mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Define access boundaries.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2 md:mb-3 ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Identity</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      placeholder="e.g. Moderator"
                      className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-black outline-none border transition-all ${
                        isDark 
                          ? 'bg-white/5 border-white/10 focus:border-[#22FF88] text-white placeholder:text-white/10' 
                          : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44] placeholder:text-[#0A1F44]/30'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2 md:mb-3 ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Briefing</label>
                    <textarea
                      rows={3}
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      placeholder="Purpose"
                      className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-black outline-none border transition-all resize-none ${
                        isDark 
                          ? 'bg-white/5 border-white/10 focus:border-[#22FF88] text-white placeholder:text-white/10' 
                          : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44] placeholder:text-[#0A1F44]/30'
                      }`}
                    />
                  </div>

                  <div className="pt-2 md:pt-4 pb-2">
                    <button
                      onClick={handleCreateRole}
                      disabled={!newRole.name.trim()}
                      className={`w-full py-4 md:py-5 rounded-lg md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 transition-all font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl ${
                        newRole.name.trim() 
                          ? 'bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-[1.02] shadow-[#22FF88]/20' 
                          : isDark ? 'bg-white/5 text-white/5 cursor-not-allowed border border-white/5' : 'bg-black/5 text-black/10 cursor-not-allowed border border-black/5'
                      }`}
                    >
                      Establish
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
