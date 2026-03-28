import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Camera, Bell, Shield, Save, Key, UserCheck, ShieldAlert, MapPin, CheckCircle2, GraduationCap, CheckCircle, Users } from 'lucide-react';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | notifications
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  const [profile, setProfile] = useState({
    name: 'Raj Kumar',
    email: 'raj.kumar@arena.com',
    phone: '+91 98765 43210',
  });

  const [academy, setAcademy] = useState({
    coachingStatus: true,
    activeCoaches: '5',
    academyBio: 'Elite professional training for advanced players and beginners.',
  });

  const [security, setSecurity] = useState({
    currentKey: '',
    newKey: '',
    confirmKey: '',
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    // Simulate API call
    showToast('Configuration updated successfully');
    // Clear passwords after save
    setSecurity(prev => ({ ...prev, currentKey: '', newKey: '', confirmKey: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        showToast('Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Identity Profile', icon: User },
    { id: 'academy', label: 'Coach On Board', icon: GraduationCap },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'notifications', label: 'System Alerts', icon: Bell },
  ];

  return (
    <div className="bg-[#F4F7F6] min-h-full p-2 md:p-4 lg:p-6 font-sans">
      <div className="max-w-[1100px] mx-auto space-y-3 md:space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg md:text-xl font-black font-display tracking-tight flex items-center gap-2 text-[#1a2b3c]">
              <User className="text-[#eb483f] w-[18px] h-[18px] md:w-[22px] md:h-[22px]" strokeWidth={2.5} /> Account Configuration
            </h2>
            <p className="text-[10px] md:text-xs mt-0.5 font-bold text-slate-500">Manage administrative credentials and notification preferences.</p>
          </div>
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-xl hover:shadow-[#eb483f]/20 hover:-translate-y-0.5 transition-all text-[11px] font-black uppercase tracking-[0.1em] shadow-sm"
          >
            <Save size={16} strokeWidth={3} /> Save Adjustments
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 lg:flex-none flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all border text-left ${
                  activeTab === tab.id
                    ? 'bg-white border-slate-200 shadow-sm text-[#eb483f]'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 transition-all hover:border-[#eb483f]/40"
              >
                {activeTab === 'profile' && (
                  <div className="space-y-6 md:space-y-8">
                    {/* User Intro Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-8">
                      <div className="relative group">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div 
                          onClick={() => fileInputRef.current.click()}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center cursor-pointer transition-all hover:border-[#eb483f]/40 relative"
                        >
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={36} className="text-slate-200" strokeWidth={1.5} />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                             <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <button 
                          onClick={() => fileInputRef.current.click()}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-[#eb483f] border border-[#eb483f] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
                        >
                          <Camera size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="text-center sm:text-left space-y-0.5">
                        <h3 className="text-xl font-black text-[#1a2b3c] tracking-tight">Raj Kumar</h3>
                        <p className="text-[9px] font-black text-[#eb483f] uppercase tracking-[0.2em]">ARENA_ADMIN • ELITE SMASH</p>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md mt-2">
                           <Shield size={10} className="text-[#eb483f]" strokeWidth={2.5} />
                           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">High-Trust Account</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Full Legal Name</label>
                        <div className="relative">
                          <UserCheck size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                          <input
                            type="text"
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Business Email</label>
                        <div className="relative">
                           <Mail size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                           <input
                            type="email"
                            value={profile.email}
                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Phone Number</label>
                        <div className="relative">
                           <Phone size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                           <input
                            type="tel"
                            value={profile.phone}
                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-xs font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Facility Domain</label>
                        <div className="relative">
                          <MapPin size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="text"
                            readOnly
                            defaultValue="Elite Badminton Hub, HSR"
                            className="w-full bg-slate-100 border border-slate-100 rounded-lg py-3 pl-10 pr-4 text-xs font-bold text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'academy' && (
                  <div className="flex items-center justify-center py-10 md:py-16">
                    <div className="bg-white border border-slate-100 rounded-[28px] p-7 max-w-sm w-full shadow-sm hover:shadow-md transition-all text-center space-y-6">
                       <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] mb-1">
                             <GraduationCap size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-[#1a2b3c] tracking-tight uppercase tracking-widest">Coach On Board</h3>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">
                               Visibility control for academy trainers
                            </p>
                          </div>
                       </div>

                       <div className="flex bg-slate-50 p-1.5 rounded-[18px] gap-1.5 border border-slate-100 shadow-inner">
                          <button 
                            onClick={() => setAcademy({...academy, coachingStatus: true})}
                            className={`flex-1 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                              academy.coachingStatus 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95' 
                                : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                             Active
                          </button>
                          <button 
                            onClick={() => setAcademy({...academy, coachingStatus: false})}
                            className={`flex-1 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                              !academy.coachingStatus 
                                ? 'bg-[#eb483f] text-white shadow-lg shadow-[#eb483f]/20 active:scale-95' 
                                : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                             Inactive
                          </button>
                       </div>

                       <div className="pt-3 border-t border-slate-50 flex items-center justify-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${academy.coachingStatus ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                             System is currently {academy.coachingStatus ? 'Live' : 'Hidden'}
                          </span>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Key size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#1a2b3c] tracking-tight">Security Access Keys</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manage authentication layer</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Current Master Key</label>
                        <input
                          type="password"
                          value={security.currentKey}
                          onChange={e => setSecurity({ ...security, currentKey: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-xs font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">New Access Key</label>
                          <input
                            type="password"
                            value={security.newKey}
                            onChange={e => setSecurity({ ...security, newKey: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-xs font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                        <div className="group">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Confirm Initialization</label>
                          <input
                            type="password"
                            value={security.confirmKey}
                            onChange={e => setSecurity({ ...security, confirmKey: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-xs font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="bg-[#eb483f]/5 border border-[#eb483f]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#eb483f] shadow-sm border border-[#eb483f]/20">
                          <ShieldAlert size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#eb483f] mb-0.5">Two-Factor Shield</h4>
                          <p className="text-[11px] font-bold text-slate-500 leading-snug">
                            Protect facility data with unique mobile codes.
                          </p>
                        </div>
                        <button className="px-6 py-2.5 bg-[#eb483f] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all">
                          Activate
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Bell size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#1a2b3c] tracking-tight">Notification Registry</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Define alert triggers</p>
                      </div>
                    </div>

                    <div className="pt-2 divide-y divide-slate-100">
                      {[
                        { label: 'Booking Confirmation', desc: 'Alert when a new slot is locked.' },
                        { label: 'Asset Maintenance', desc: 'Critical court health status updates.' },
                        { label: 'Financial Settlement', desc: 'Payment logs and ledger audits.' },
                        { label: 'Security Breach', desc: 'Unauthorized role override attempts.' },
                      ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between py-3 group first:pt-0 last:pb-0">
                          <div className="max-w-[80%]">
                            <p className="text-xs font-black text-[#1a2b3c] uppercase tracking-wide group-hover:text-[#eb483f] transition-colors">{pref.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{pref.desc}</p>
                          </div>
                          <div className="w-9 h-5 rounded-full relative transition-colors cursor-pointer bg-slate-200">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
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

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[1000] px-6 py-3 rounded-2xl bg-[#1a2b3c] text-white text-[13px] font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
               <CheckCircle2 size={14} />
            </div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountSettings;
