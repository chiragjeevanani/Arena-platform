import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings, ArrowLeft, MapPin, QrCode, Ticket, Zap, Trophy, TrendingUp, ChevronLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ARENAS, USER_BOOKINGS, COACHING_BATCHES } from '../../../data/mockData';

const Profile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Mock Data logic for "Next Match"
  const nextMatch = USER_BOOKINGS.filter(b => b.status === "Upcoming")[0];
  const activeCoaching = COACHING_BATCHES[0];
  const favoriteArenas = ARENAS; // Mock favorite arenas

  const menuItems = [
    { icon: History, label: 'Booking History', path: '/bookings' },
    { icon: Wallet, label: 'My Wallet Tracker', path: '/profile/wallet' },
    { icon: Shield, label: 'Privacy & Security', path: '/profile/privacy' },
    { icon: HelpCircle, label: 'Help & Support', path: '/profile/help' },
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-[#FFF1F1]'}`}>
      
      {/* Background Decorative Glows */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-50 ${isDark ? 'bg-[#eb483f]/10' : 'bg-[#eb483f]/10'}`} />
      <div className={`absolute top-[400px] -left-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40 ${isDark ? 'bg-blue-500/10' : 'bg-[#eb483f]/5'}`} />

      {/* ═╦═╦═╦═╦═ HEADER SECTION ═╦═╦═╦═╦═ */}
      <div className="pt-8 px-5 md:px-8 max-w-5xl mx-auto relative z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-[#0F172A] shadow-sm hover:shadow-md'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Welcome back, <span className="text-[#eb483f]">Muhammad!</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-yellow-500'} animate-pulse`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-yellow-400/80' : 'text-yellow-600'}`}>Level 4.9 Premium</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile/edit')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}>
              <Settings size={20} />
            </button>
            <div className="relative group cursor-pointer" onClick={() => navigate('/profile/edit')}>
              <div className="w-12 h-12 rounded-xl overflow-hidden border-[2px] border-[#eb483f]/40 p-0.5 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                  alt="User avatar"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═╦═╦═╦═╦═ HERO DASHBOARD GRID ═╦═╦═╦═╦═ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          
          {/* 1. Next Match / "Next Up" Widget - Most Prominent */}
          <div className="md:col-span-8">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Next Up</h3>
            {nextMatch ? (
              <motion.div 
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl overflow-hidden border p-5 md:p-6 shadow-xl transition-all ${
                  isDark 
                    ? 'bg-gradient-to-br from-[#1a1d24] to-[#0f1115] border-white/10' 
                    : 'bg-white border-slate-100 shadow-[0_20px_40px_rgba(235,72,63,0.05)]'
                }`}
              >
                {/* Glowing red accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb483f]/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-[#eb483f]/20 flex-shrink-0">
                      <img src={nextMatch.arenaImage} alt="Arena" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eb483f]/10 text-[#eb483f] mb-2 border border-[#eb483f]/20">
                        <Zap size={10} className="fill-[#eb483f]" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Starts Today, 7:00 PM</span>
                      </div>
                      <h4 className={`text-lg md:text-xl font-bold font-display leading-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                        {nextMatch.arenaName}
                      </h4>
                      <p className={`text-[12px] font-medium flex items-center gap-1 mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                        <MapPin size={12} /> {nextMatch.courtName} â€¢ {nextMatch.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className={`flex items-center justify-center p-3.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                      <QrCode size={20} />
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#eb483f] text-white font-bold text-sm shadow-[0_8px_20px_rgba(235,72,63,0.3)] hover:shadow-[0_12px_25px_rgba(235,72,63,0.4)] transition-all hover:-translate-y-1">
                      <Ticket size={16} /> View Ticket
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className={`rounded-3xl border border-dashed flex flex-col items-center justify-center p-10 text-center ${isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-50'}`}>
                <div className="w-12 h-12 rounded-xl bg-[#eb483f]/10 text-[#eb483f] flex items-center justify-center mb-3">
                  <Ticket size={24} />
                </div>
                <p className={`font-bold ${isDark ? 'text-white/70' : 'text-slate-600'}`}>No upcoming matches</p>
                <button onClick={() => navigate('/arenas')} className="mt-4 text-[#eb483f] text-[11px] font-black uppercase tracking-widest hover:underline">Book a Court Now</button>
              </div>
            )}
          </div>

          {/* 2. Wallet & Finance Snapshot */}
          <div className="md:col-span-4">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>My Wallet</h3>
            <div className={`h-[120px] md:h-[136px] rounded-3xl border p-5 md:p-6 flex flex-col justify-between relative overflow-hidden transition-all shadow-lg ${
              isDark 
                ? 'bg-[#1a1d24] border-white/5' 
                : 'bg-[#0F172A] border-[#0F172A]' // Dark card even on light mode for premium feel
            }`}>
              {/* Subtle tech background pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold font-display">Available Balance</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-white/70 text-lg font-bold font-display">â‚¹</span>
                    <span className="text-white text-3xl font-black font-display tracking-tight">1,450</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner">
                  <Wallet size={18} />
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                <button onClick={() => navigate('/profile/wallet')} className="flex-1 py-2 rounded-lg bg-[#eb483f] text-white text-[11px] font-bold tracking-wide hover:bg-[#eb483f]/90 transition-colors text-center shadow-[0_4px_10px_rgba(235,72,63,0.3)]">
                  Top Up
                </button>
                <button onClick={() => navigate('/bookings')} className="flex-1 py-2 rounded-lg bg-white/10 text-white text-[11px] font-bold tracking-wide hover:bg-white/20 transition-colors text-center backdrop-blur-sm">
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═╦═╦═╦═╦═ SECONDARY GRID ═╦═╦═╦═╦═ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 mt-6 md:mt-8">
          
          {/* 3. "Book It Again" / Favorite Arenas */}
          <div className="md:col-span-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Book It Again</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {favoriteArenas.map((arena) => (
                <div key={arena.id} onClick={() => navigate(`/arenas/${arena.id}`)} className={`min-w-[240px] md:min-w-[280px] p-3 rounded-2xl border cursor-pointer group transition-all snap-start shadow-sm hover:shadow-md ${
                  isDark ? 'bg-white/5 border-white/10 hover:border-[#eb483f]/50' : 'bg-white border-slate-200 hover:border-[#eb483f]/60'
                }`}>
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative">
                      <img src={arena.image} alt={arena.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-[#eb483f]/0 group-hover:bg-[#eb483f]/20 transition-colors" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm tracking-tight truncate w-[140px] md:w-[180px] ${isDark ? 'text-white' : 'text-slate-800'}`}>{arena.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star size={10} className="text-[#eb483f] fill-[#eb483f]" />
                        <span className={`text-[10px] font-bold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{arena.rating} â€¢ {arena.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Active Coaching Progress */}
          <div className="md:col-span-6">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>My Coaching Progress</h3>
            {activeCoaching ? (
              <div className={`p-5 md:p-6 rounded-3xl border transition-all shadow-sm ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm">
                      <img src={activeCoaching.image} alt="Coach" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm md:text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeCoaching.coachName}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{activeCoaching.level} Batch</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Stats</p>
                    <p className={`font-black font-display text-lg text-[#eb483f]`}>12/15</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                    <span className={isDark ? 'text-white/60' : 'text-slate-500'}>Classes Attended</span>
                    <span className="text-[#eb483f]">80%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <motion.div 
                      className="h-full bg-[#eb483f] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <p className={`text-[10px] italic ${isDark ? 'text-emerald-400/80' : 'text-emerald-600 font-medium'}`}>
                  "Great footwork improvement today. Keep practicing those smashes!" 
                </p>
              </div>
            ) : (
              <div className={`rounded-3xl border border-dashed flex flex-col items-center justify-center p-8 text-center h-[160px] ${isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-50'}`}>
                <p className={`font-bold ${isDark ? 'text-white/70' : 'text-slate-600'}`}>Not enrolled in coaching</p>
                <button onClick={() => navigate('/coaching')} className="mt-2 text-[#eb483f] text-[11px] font-black uppercase tracking-widest hover:underline">Explore Programs</button>
              </div>
            )}
          </div>
        </div>

        {/* ═╦═╦═╦═╦═ PLAYER STATS & SETTINGS ═╦═╦═╦═╦═ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 mt-6 md:mt-8 pb-10">
          
          {/* 5. Quick Player Stats */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className={`p-4 md:p-5 rounded-2xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div>
                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Courts Conquered</p>
                <h4 className={`font-black font-display text-2xl ${isDark ? 'text-white' : 'text-slate-800'}`}>12</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Trophy size={18} />
              </div>
            </div>
            <div className={`p-4 md:p-5 rounded-2xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div>
                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Hours Played</p>
                <h4 className={`font-black font-display text-2xl ${isDark ? 'text-white' : 'text-slate-800'}`}>38h</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
          </div>

          {/* 6. Settings / Navigation Grid */}
          <div className="md:col-span-8">
            <div className={`rounded-3xl border shadow-sm p-2 md:p-3 overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'}`}>
              {menuItems.map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 6 }}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isDark ? 'bg-white/5 text-white/50 group-hover:bg-[#eb483f]/10 group-hover:text-[#eb483f]' : 'bg-slate-100 text-slate-500 group-hover:bg-[#eb483f]/10 group-hover:text-[#eb483f]'
                    }`}>
                      <item.icon size={18} />
                    </div>
                    <span className={`font-bold text-sm tracking-tight ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{item.label}</span>
                  </div>
                  <div className={`p-1.5 rounded-full transition-all ${isDark ? 'text-white/20 group-hover:text-white/60 group-hover:bg-white/10' : 'text-slate-300 group-hover:text-slate-600 group-hover:bg-slate-200'}`}>
                    <ChevronRight size={14} />
                  </div>
                </motion.button>
              ))}
            </div>

            <button 
              onClick={() => navigate('/login')}
              className={`w-full mt-4 p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-center gap-3 transition-all font-black text-[12px] uppercase tracking-widest ${
                isDark 
                  ? 'bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10' 
                  : 'bg-white border-red-100 text-red-500 shadow-sm hover:bg-red-50'
              }`}
            >
              <LogOut size={16} /> Logout Account
            </button>
          </div>
        </div>
        
      </div>
      
      {/* End gradient fade at bottom */}
      <div className={`absolute bottom-0 w-full h-32 pointer-events-none bg-gradient-to-t to-transparent ${isDark ? 'from-[#0f1115]' : 'from-[#FFF1F1]'}`} />
    </div>
  );
};

export default Profile;
