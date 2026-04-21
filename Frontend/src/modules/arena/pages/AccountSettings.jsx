import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Camera, Bell, Shield, Save, Key, UserCheck, ShieldAlert, MapPin } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { patchMyProfile } from '../../../services/meApi';
import { meRequest } from '../../../services/authApi';

const AccountSettings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState([true, true, false, true]);
  const [profileImg, setProfileImg] = useState(localStorage.getItem('arena_manager_img'));
  const [showImgModal, setShowImgModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    if (user.avatar) setProfileImg(user.avatar);
  }, [user]);

  const TABS = [
    { id: 'profile', label: 'Identity Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Lock },
  ];

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);
    try {
      localStorage.setItem('arena_manager_img', profileImg || '');
      if (isApiConfigured() && getAuthToken()) {
        await patchMyProfile({
          name: name.trim(),
          phone: phone.trim(),
          avatarUrl: profileImg || '',
        });
        const me = await meRequest();
        const u = me.user;
        const mapped = {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          phone: u.phone || '',
          assignedArena: u.assignedArenaId || 'all',
          avatar: u.avatarUrl || profileImg || '',
        };
        setUser(mapped);
        localStorage.setItem('user', JSON.stringify(mapped));
      }
    } catch (e) {
      setSaveError(e.message || 'Could not save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result);
        localStorage.setItem('arena_manager_img', reader.result);
        // Dispatch event for other components to update
        window.dispatchEvent(new Event('storage_update'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#FFF1F1] min-h-full p-4 md:p-6 lg:p-8 pt-2 md:pt-4 lg:pt-4 font-nunito">
      <div className="max-w-[850px] ml-0 space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-oswald tracking-tight flex items-center gap-3 text-[#36454F] uppercase">
              <User className="text-[#CE2029]" size={24} strokeWidth={2.5} /> Account Settings
            </h2>
            <p className="text-xs mt-1 font-semibold text-slate-500 uppercase tracking-wider">Manage your manager profile and security preferences</p>
            {saveError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{saveError}</p>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#CE2029] text-white hover:shadow-xl hover:shadow-[#CE2029]/30 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} strokeWidth={2.5} />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1 flex lg:flex-col gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all border text-left ${
                  activeTab === tab.id
                    ? 'bg-white border-[#CE2029]/20 shadow-md shadow-[#CE2029]/5 text-[#CE2029]'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                <tab.icon size={15} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[1.5rem] border border-[#CE2029]/5 shadow-xl shadow-[#CE2029]/5 p-4 md:p-5"
              >
                {activeTab === 'profile' && (
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative group">
                        <div 
                          onClick={() => profileImg && setShowImgModal(true)}
                          className={`w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner relative ${profileImg ? 'cursor-pointer' : ''}`}
                        >
                          {profileImg ? (
                            <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} className="text-slate-200" strokeWidth={1.5} />
                          )}
                        </div>
                        <label className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-lg bg-[#CE2029] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <Camera size={12} strokeWidth={2.5} />
                        </label>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-[#36454F] font-oswald uppercase tracking-tight">{name || 'Arena staff'}</h3>
                        <p className="text-[10px] font-bold text-[#CE2029] uppercase tracking-[0.2em] mt-0.5">Arena account</p>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#CE2029]/5 border border-[#CE2029]/10 rounded-full mt-1.5">
                           <Shield size={10} className="text-[#CE2029]" strokeWidth={2.5} />
                           <span className="text-[8px] font-bold text-[#CE2029] uppercase tracking-widest leading-none">Verified Account</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Full Name</label>
                        <div className="relative">
                          <UserCheck size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-semibold text-[#36454F] focus:outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Email Address</label>
                        <div className="relative">
                           <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                           <input
                             type="email"
                             readOnly
                             value={user?.email || ''}
                             className="w-full cursor-not-allowed bg-slate-100 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-semibold text-slate-500"
                           />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Phone Number</label>
                        <div className="relative">
                           <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
                           <input
                             type="tel"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-semibold text-[#36454F] focus:outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-sm"
                           />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Arena Location</label>
                        <div className="relative">
                          <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="text" readOnly defaultValue="AMM Sports Arena, Main Branch" className="w-full bg-slate-100 border border-slate-100 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-bold text-slate-400 cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                        <Key size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#36454F] font-oswald uppercase tracking-wide">Security & Access</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your password and security keys</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] font-semibold text-[#36454F] focus:outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-sm" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] font-semibold text-[#36454F] focus:outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-sm" />
                        </div>
                        <div className="group">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Confirm Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] font-semibold text-[#36454F] focus:outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-sm" />
                        </div>
                      </div>

                      <div className="bg-[#CE2029]/5 border border-[#CE2029]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#CE2029] shadow-lg shadow-[#CE2029]/10 border border-[#CE2029]/10">
                          <ShieldAlert size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#CE2029] mb-1">Two-Factor Authentication</h4>
                          <p className="text-[12px] font-semibold text-slate-500 leading-snug">
                            Add an extra layer of security to your manager account.
                          </p>
                        </div>
                        <button className="px-8 py-3 bg-[#CE2029] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-[#CE2029]/30 hover:-translate-y-0.5 transition-all">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImgModal && profileImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowImgModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img src={profileImg} alt="Profile Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setShowImgModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountSettings;
