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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <User className="text-[#22FF88]" /> Account Settings
          </h2>
          <p className={`text-sm mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Manage your administrative profile and security preferences.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#22FF88]/20 to-transparent border-[#22FF88]/30 border-l-4 border-l-[#22FF88] text-[#22FF88]'
                  : isDark 
                    ? 'border-transparent text-white/40 hover:bg-white/5' 
                    : 'border-transparent text-[#0A1F44]/40 hover:bg-[#0A1F44]/5'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2.5rem] border p-8 lg:p-10 ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-xl'}`}
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#1EE7FF]/20 to-[#22FF88]/20 border-2 border-[#22FF88]/30 overflow-hidden flex items-center justify-center">
                      <User size={64} className="text-[#22FF88]/40" />
                    </div>
                    <button className="absolute bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#22FF88] text-[#0A1F44] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Super Admin</h3>
                    <p className="text-xs font-bold text-[#1EE7FF] uppercase tracking-widest mt-1">Arena Manager • High Security Level</p>
                    <p className={`text-[10px] mt-4 font-medium opacity-40 uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Recommended size: 512x512px</p>
                  </div>
                </div>

                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Full Name</label>
                    <input
                      type="text"
                      defaultValue="Badminton Admin"
                      className={`w-full bg-transparent border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                        isDark ? 'border-white/10 text-white focus:border-[#22FF88]' : 'border-black/10 text-[#0A1F44] focus:border-[#22FF88]'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Email Address</label>
                    <input
                      type="email"
                      defaultValue="admin@badminton.io"
                      className={`w-full bg-transparent border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                        isDark ? 'border-white/10 text-white focus:border-[#22FF88]' : 'border-black/10 text-[#0A1F44] focus:border-[#22FF88]'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className={`w-full bg-transparent border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                        isDark ? 'border-white/10 text-white focus:border-[#22FF88]' : 'border-black/10 text-[#0A1F44] focus:border-[#22FF88]'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Assigned Arena</label>
                    <input
                      type="text"
                      readOnly
                      defaultValue="Olympic Arena Smash"
                      className={`w-full bg-white/5 border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none opacity-60 cursor-not-allowed ${
                        isDark ? 'border-white/10 text-white' : 'border-black/10 text-[#0A1F44]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 text-[#22FF88]">
                  <Shield size={24} />
                  <h3 className="text-lg font-black uppercase tracking-widest">Security Credentials</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Current Password</label>
                    <input
                      type="password"
                      className={`w-full bg-transparent border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                        isDark ? 'border-white/10 text-white focus:border-[#22FF88]' : 'border-black/10 text-[#0A1F44] focus:border-[#22FF88]'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>New Password</label>
                      <input
                        type="password"
                        className={`w-full bg-transparent border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                          isDark ? 'border-white/10 text-white focus:border-[#22FF88]' : 'border-black/10 text-[#0A1F44] focus:border-[#22FF88]'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/50'}`}>Confirm Password</label>
                      <input
                        type="password"
                        className={`w-full bg-transparent border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-all ${
                          isDark ? 'border-white/10 text-white focus:border-[#22FF88]' : 'border-black/10 text-[#0A1F44] focus:border-[#22FF88]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#FF4B4B]/5 border-[#FF4B4B]/20' : 'bg-[#FF4B4B]/5 border-[#FF4B4B]/10'}`}>
                    <h4 className="text-[#FF4B4B] text-xs font-black uppercase tracking-widest mb-2 italic">Two-Factor Authentication</h4>
                    <p className={`text-[10px] font-medium leading-relaxed opacity-60 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                      Enhance your account security by adding an extra layer of protection. We'll send a code to your phone every time you log in.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-[#FF4B4B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#FF4B4B]/20">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 text-[#FFD600]">
                  <Bell size={24} />
                  <h3 className="text-lg font-black uppercase tracking-widest">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'System Alerts', desc: 'Crucial system updates and maintenance alerts' },
                    { label: 'Booking Confirmed', desc: 'When a user successfully books a court' },
                    { label: 'Financial Summaries', desc: 'Daily and weekly revenue reports' },
                    { label: 'Inventory Updates', desc: 'Alerts for low stock or product sales' },
                  ].map((pref, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-[#0A1F44]/5 border-black/5'}`}>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{pref.label}</p>
                        <p className={`text-[10px] font-medium opacity-40 mt-1 italic`}>{pref.desc}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isDark ? 'bg-[#22FF88]/20' : 'bg-[#22FF88]/40'}`}>
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-md animate-pulse" />
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
