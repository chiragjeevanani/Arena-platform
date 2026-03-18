import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Camera, Bell, Shield, Save, Key, UserCheck, ShieldAlert, MapPin } from 'lucide-react';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | notifications

  const TABS = [
    { id: 'profile', label: 'Identity Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'notifications', label: 'System Alerts', icon: Bell },
  ];

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
              <User className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Account Configuration
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Manage your administrative credentials and notification preferences.</p>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20">
            <Save size={16} strokeWidth={3} /> Save Adjustments
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 lg:flex-none flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all border text-left ${
                  activeTab === tab.id
                    ? 'bg-white border-slate-200 shadow-sm text-[#eb483f]'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[11px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-10 transition-all hover:border-[#eb483f]/40"
              >
                {activeTab === 'profile' && (
                  <div className="space-y-8 md:space-y-10">
                    {/* User Intro Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                      <div className="relative group">
                        <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                          <User size={48} className="text-slate-200" strokeWidth={1.5} />
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Camera size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="text-center sm:text-left space-y-1">
                        <h3 className="text-2xl font-black text-[#1a2b3c] tracking-tight">Raj Kumar</h3>
                        <p className="text-xs font-black text-[#eb483f] uppercase tracking-[0.2em]">ARENA_ADMIN • ELITE SMASH</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mt-4">
                           <Shield size={12} className="text-[#eb483f]" strokeWidth={2.5} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">High-Trust Account</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Full Legal Name</label>
                        <div className="relative">
                          <UserCheck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                          <input
                            type="text"
                            defaultValue="Raj Kumar"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Business Email</label>
                        <div className="relative">
                           <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                           <input
                            type="email"
                            defaultValue="raj.kumar@arena.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Phone Number</label>
                        <div className="relative">
                           <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                           <input
                            type="tel"
                            defaultValue="+91 98765 43210"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Facility Domain</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="text"
                            readOnly
                            defaultValue="Elite Badminton Hub, HSR"
                            className="w-full bg-slate-100 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-[13px] font-bold text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Key size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#1a2b3c] tracking-tight">Security Access Keys</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Manage your authentication layer</p>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Current Master Key</label>
                        <input
                          type="password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">New Access Key</label>
                          <input
                            type="password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                        <div className="group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Confirm Initialization</label>
                          <input
                            type="password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="bg-[#eb483f]/5 border border-[#eb483f]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#eb483f] shadow-sm border border-[#eb483f]/20">
                          <ShieldAlert size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#eb483f] mb-1">Two-Factor Shield</h4>
                          <p className="text-[12px] font-bold text-slate-500 leading-snug">
                            Protect your facility data by requiring a unique code generated on your mobile device.
                          </p>
                        </div>
                        <button className="px-8 py-3 bg-[#eb483f] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all">
                          Activate
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <Bell size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#1a2b3c] tracking-tight">System Notification Registry</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Define operational alert triggers</p>
                      </div>
                    </div>

                    <div className="pt-4 divide-y divide-slate-100">
                      {[
                        { label: 'Booking Confirmation', desc: 'Alert when a new slot is locked into the registry.' },
                        { label: 'Asset Maintenance', desc: 'Critical system or court health status updates.' },
                        { label: 'Financial Settlement', desc: 'Real-time ledger audit and payment logs.' },
                        { label: 'Security Breach', desc: 'Unauthorized access or role override attempts.' },
                      ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between py-5 group first:pt-0 last:pb-0">
                          <div className="max-w-[80%]">
                            <p className="text-[13px] font-black text-[#1a2b3c] uppercase tracking-wide group-hover:text-[#eb483f] transition-colors">{pref.label}</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1">{pref.desc}</p>
                          </div>
                          <div className="w-11 h-6 rounded-full relative transition-colors cursor-pointer bg-slate-200">
                            <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
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
    </div>
  );
};

export default AccountSettings;
