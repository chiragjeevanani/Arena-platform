import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Camera, Bell, Shield, Save, Key, UserCheck, ShieldAlert, MapPin } from 'lucide-react';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState([true, true, false, true]);
  const [profileImg, setProfileImg] = useState(localStorage.getItem('arena_manager_img'));
  const [showImgModal, setShowImgModal] = useState(false);

  const TABS = [
    { id: 'profile', label: 'Identity Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'notifications', label: 'System Alerts', icon: Bell },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
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
            <h2 className="text-xl md:text-2xl font-bold font-oswald tracking-tight flex items-center gap-3 text-[#1a2b3c] uppercase">
              <User className="text-[#eb483f]" size={24} strokeWidth={2.5} /> Account Settings
            </h2>
            <p className="text-xs mt-1 font-semibold text-slate-500 uppercase tracking-wider">Manage your manager profile and security preferences</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#eb483f] text-white hover:shadow-xl hover:shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
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
                    ? 'bg-white border-[#eb483f]/20 shadow-md shadow-[#eb483f]/5 text-[#eb483f]'
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
                className="bg-white rounded-[1.5rem] border border-[#eb483f]/5 shadow-xl shadow-[#eb483f]/5 p-4 md:p-5"
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
                        <label className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-lg bg-[#eb483f] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <Camera size={12} strokeWidth={2.5} />
                        </label>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-[#1a2b3c] font-oswald uppercase tracking-tight">Arena Manager</h3>
                        <p className="text-[10px] font-bold text-[#eb483f] uppercase tracking-[0.2em] mt-0.5">AMM SPORTS ARENA · MANAGER</p>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#eb483f]/5 border border-[#eb483f]/10 rounded-full mt-1.5">
                           <Shield size={10} className="text-[#eb483f]" strokeWidth={2.5} />
                           <span className="text-[8px] font-bold text-[#eb483f] uppercase tracking-widest leading-none">Verified Account</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Full Name</label>
                        <div className="relative">
                          <UserCheck size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                          <input type="text" defaultValue="Arena Manager" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-semibold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Email Address</label>
                        <div className="relative">
                           <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                           <input type="email" defaultValue="manager@ammsports.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-semibold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block ml-1">Phone Number</label>
                        <div className="relative">
                           <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                           <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-[12px] font-semibold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm" />
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
                      <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Key size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1a2b3c] font-oswald uppercase tracking-wide">Security & Access</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your password and security keys</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] font-semibold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] font-semibold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm" />
                        </div>
                        <div className="group">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Confirm Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[13px] font-semibold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-sm" />
                        </div>
                      </div>

                      <div className="bg-[#eb483f]/5 border border-[#eb483f]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#eb483f] shadow-lg shadow-[#eb483f]/10 border border-[#eb483f]/10">
                          <ShieldAlert size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#eb483f] mb-1">Two-Factor Authentication</h4>
                          <p className="text-[12px] font-semibold text-slate-500 leading-snug">
                            Add an extra layer of security to your manager account.
                          </p>
                        </div>
                        <button className="px-8 py-3 bg-[#eb483f] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Bell size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1a2b3c] font-oswald uppercase tracking-wide">Notifications</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage where and how you receive alerts</p>
                      </div>
                    </div>

                    <div className="space-y-2 divide-y divide-slate-50">
                      {[
                        { label: 'Booking Alerts', desc: 'Get notified when a new booking is made.' },
                        { label: 'Slot Reminders', desc: 'Alerts for upcoming slot transitions.' },
                        { label: 'Payment Logs', desc: 'Notification on successful arena payments.' },
                        { label: 'System Updates', desc: 'Stay updated with new panel features.' },
                      ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between py-4 group first:pt-0">
                          <div className="max-w-[80%] text-left">
                            <p className="text-[13px] font-bold text-[#1a2b3c] group-hover:text-[#eb483f] transition-colors">{pref.label}</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">{pref.desc}</p>
                          </div>
                          <div 
                            onClick={() => {
                              const newPrefs = [...notificationPrefs];
                              newPrefs[i] = !newPrefs[i];
                              setNotificationPrefs(newPrefs);
                            }}
                            className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${notificationPrefs[i] ? 'bg-[#eb483f]' : 'bg-slate-200'}`}
                          >
                            <motion.div 
                              animate={{ x: notificationPrefs[i] ? 20 : 2 }}
                              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md shadow-black/10" 
                            />
                          </div>
                        </div>
                      ))}
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
