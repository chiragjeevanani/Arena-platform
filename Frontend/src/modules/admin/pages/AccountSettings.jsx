import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Camera, Bell, Shield, Save } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const AccountSettings = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | notifications

  const TABS = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <User className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Settings
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Profile & Trust.</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#eb483f] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#eb483f]/20">
          <Save size={14} /> Sync
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 lg:flex-none flex items-center gap-3 px-4 py-2.5 rounded-lg md:rounded-2xl transition-all border whitespace-nowrap min-w-fit ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#eb483f]/10 to-transparent border-[#eb483f]/30 border-l-4 border-l-[#eb483f] text-[#eb483f]'
                  : isDark 
                    ? 'border-transparent text-white/20 hover:bg-white/5' 
                    : 'border-transparent text-[#0A1F44]/40 hover:bg-[#0A1F44]/5'
              }`}
            >
              <tab.icon size={14} className="md:w-[18px] md:h-[18px]" />
              <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl md:rounded-[2.5rem] border p-4 md:p-10 ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}
          >
            {activeTab === 'profile' && (
              <div className="space-y-6 md:space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
                  <div className="relative group">
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-[#eb483f]/10 to-[#eb483f]/10 border border-[#eb483f]/20 overflow-hidden flex items-center justify-center">
                      <User size={32} className="text-[#eb483f]/20 md:w-[64px] md:h-[64px]" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#eb483f] text-[#0A1F44] flex items-center justify-center shadow-lg">
                      <Camera size={12} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className={`text-base md:text-xl font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Super Admin</h3>
                    <p className="text-[7px] md:text-[10px] font-black text-[#eb483f] uppercase tracking-widest mt-0.5">Arena Scope</p>
                    <p className={`text-[7px] md:text-[10px] mt-2 md:mt-4 font-black opacity-20 uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>High Trust Account</p>
                  </div>
                </div>

                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1 md:space-y-2">
                    <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>Identity</label>
                    <input
                      type="text"
                      defaultValue="Badminton Admin"
                      className={`w-full bg-transparent border rounded-lg md:rounded-2xl px-4 py-2.5 md:py-3.5 text-[10px] md:text-sm font-black focus:outline-none transition-all ${
                        isDark ? 'border-white/5 text-white focus:border-[#eb483f]/50' : 'border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#eb483f]'
                      }`}
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>Electronic Mail</label>
                    <input
                      type="email"
                      defaultValue="admin@badminton.io"
                      className={`w-full bg-transparent border rounded-lg md:rounded-2xl px-4 py-2.5 md:py-3.5 text-[10px] md:text-sm font-black focus:outline-none transition-all ${
                        isDark ? 'border-white/5 text-white focus:border-[#eb483f]/50' : 'border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#eb483f]'
                      }`}
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>Contact</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className={`w-full bg-transparent border rounded-lg md:rounded-2xl px-4 py-2.5 md:py-3.5 text-[10px] md:text-sm font-black focus:outline-none transition-all ${
                        isDark ? 'border-white/5 text-white focus:border-[#eb483f]/50' : 'border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#eb483f]'
                      }`}
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>Network Scope</label>
                    <input
                      type="text"
                      readOnly
                      defaultValue="Olympic Arena Smash"
                      className={`w-full bg-white/2 border rounded-lg md:rounded-2xl px-4 py-2.5 md:py-3.5 text-[10px] md:text-sm font-black opacity-30 cursor-not-allowed ${
                        isDark ? 'border-white/5 text-white' : 'border-[#0A1F44]/10 text-[#0A1F44]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 text-[#eb483f] opacity-60">
                  <Shield size={16} />
                  <h3 className="text-[10px] md:text-lg font-black uppercase tracking-widest">Credentials</h3>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-1 md:space-y-2">
                    <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>Current Key</label>
                    <input
                      type="password"
                      className={`w-full bg-transparent border rounded-lg md:rounded-2xl px-4 py-2.5 text-[10px] md:text-sm font-black focus:outline-none transition-all ${
                        isDark ? 'border-white/5 text-white focus:border-[#eb483f]/20' : 'border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#eb483f]'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2">
                      <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>New Key</label>
                      <input
                        type="password"
                        className={`w-full bg-transparent border rounded-lg md:rounded-2xl px-4 py-2.5 text-[10px] md:text-sm font-black focus:outline-none transition-all ${
                          isDark ? 'border-white/5 text-white focus:border-[#eb483f]/20' : 'border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#eb483f]'
                        }`}
                      />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className={`block text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>Confirm</label>
                      <input
                        type="password"
                        className={`w-full bg-transparent border rounded-lg md:rounded-2xl px-4 py-2.5 text-[10px] md:text-sm font-black focus:outline-none transition-all ${
                          isDark ? 'border-white/5 text-white focus:border-[#eb483f]/20' : 'border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#eb483f]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-3 md:p-6 rounded-xl md:rounded-2xl border ${isDark ? 'bg-[#FF4B4B]/5 border-[#FF4B4B]/10' : 'bg-[#FF4B4B]/2 border-[#FF4B4B]/5'}`}>
                    <h4 className="text-[#FF4B4B] text-[8px] md:text-xs font-black uppercase tracking-widest mb-1 italic">Factor Authentication</h4>
                    <p className={`text-[7px] md:text-[10px] font-black leading-tight opacity-20 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                      Enhance account security via biometric or mobile verification.
                    </p>
                    <button className="mt-3 px-3 py-1.5 bg-[#FF4B4B] text-white rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#FF4B4B]/20">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 text-[#eb483f] opacity-60">
                  <Bell size={16} />
                  <h3 className="text-[10px] md:text-lg font-black uppercase tracking-widest">Alerts</h3>
                </div>

                <div className="divide-y divide-white/5">
                  {[
                    { label: 'System', desc: 'Maintenance' },
                    { label: 'Units', desc: 'Operational' },
                    { label: 'Ledger', desc: 'Financial' },
                    { label: 'Stock', desc: 'Inventory' },
                  ].map((pref, i) => (
                    <div key={i} className={`flex items-center justify-between py-2 md:py-4 transition-all`}>
                      <div>
                        <p className={`text-[9px] md:text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{pref.label}</p>
                        <p className={`text-[7px] font-black opacity-10 mt-0.5 italic`}>{pref.desc}</p>
                      </div>
                      <div className={`w-8 h-4 md:w-12 md:h-6 rounded-full relative transition-colors cursor-pointer ${isDark ? 'bg-[#eb483f]/10' : 'bg-[#eb483f]/20'}`}>
                        <div className="absolute right-0.5 top-0.5 w-3 md:w-5 h-3 md:h-5 rounded-full bg-[#eb483f] shadow-lg shadow-[#eb483f]/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;


