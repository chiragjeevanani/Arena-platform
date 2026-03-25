import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings, ArrowLeft, MapPin, QrCode, Ticket, Zap, Trophy, TrendingUp, ChevronLeft, CreditCard } from 'lucide-react';
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
    <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a0a0c]' : 'bg-[#fafafa]'}`}>
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className={`absolute top-[40%] -left-32 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/10'}`} />

      {/* HEADER SECTION (Red Bar matching other global layouts) */}
      <div className={`px-4 md:px-6 py-6 pb-8 rounded-b-[2rem] relative overflow-hidden transition-all duration-500 z-[100] mb-6 shadow-xl bg-[#eb483f]`}>
        {/* Subtle dynamic pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:16px_16px]" />
        
        <div className="flex items-center justify-between relative z-10 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all bg-white/5 border-white/10 text-white hover:bg-white/10 shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => navigate('/profile/edit')}>
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 p-0.5 shadow-md border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black font-display leading-tight tracking-tight text-white shadow-sm">
                  Muhammad <span className="text-white/80">A.</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Lvl 4 Premium</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/profile/edit')} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white shadow-sm">
            <Pencil size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-5xl mx-auto relative z-20">
        
        {/* HERO DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* 1. Next Match Widget */}
          <div className="md:col-span-8 group">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Next Up</h3>
            {nextMatch ? (
              <motion.div 
                whileHover={{ y: -2 }}
                className={`relative rounded-2xl overflow-hidden border p-4 shadow-sm transition-all hover:shadow-md ${
                  isDark 
                    ? 'bg-[#12141a] border-white/5 group-hover:border-white/10' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#eb483f]/10 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex flex-row items-center justify-between gap-4 relative z-10 w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-200/20">
                      <img src={nextMatch.arenaImage} alt="Arena" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#eb483f]/10 text-[#eb483f] mb-1.5 w-max">
                        <Zap size={10} className="fill-[#eb483f]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Today, 7:00 PM</span>
                      </div>
                      <h4 className={`text-sm md:text-base font-bold leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {nextMatch.arenaName}
                      </h4>
                      <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin size={10} /> {nextMatch.courtName}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <button className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#eb483f] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all hover:bg-[#d83f36]">
                      <Ticket size={14} /> Ticket
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className={`rounded-2xl border border-dashed flex items-center justify-center p-6 text-center ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eb483f]/10 text-[#eb483f] flex items-center justify-center">
                    <Ticket size={16} />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No upcoming matches</p>
                    <button onClick={() => navigate('/arenas')} className="text-[#eb483f] text-[10px] font-bold uppercase tracking-wider hover:underline">Book a Court</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Wallet & Finance Snapshot */}
          <div className="md:col-span-4 group">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>My Wallet</h3>
            <div className={`h-[90px] md:h-[102px] rounded-2xl border p-4 flex justify-between relative overflow-hidden transition-all shadow-sm ${
              isDark 
                ? 'bg-gradient-to-br from-[#16181f] to-[#12141a] border-white/5 group-hover:border-white/10' 
                : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800' // Keep it dark and premium even on light mode
            }`}>
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:12px_12px]" />
              
              <div className="relative z-10 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1 text-white/60">
                  <Wallet size={12} />
                  <p className="text-[9px] uppercase tracking-wider font-bold">Balance</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white/80 text-sm font-bold">₹</span>
                  <span className="text-white text-2xl md:text-3xl font-black tracking-tight">1,450</span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end gap-2 justify-center">
                <button onClick={() => navigate('/profile/wallet')} className="px-3 py-1.5 rounded-lg bg-[#eb483f] text-white text-[10px] md:text-xs font-bold tracking-wide hover:bg-[#d83f36] transition-colors shadow-sm w-full text-center">
                  Top Up
                </button>
                <button onClick={() => navigate('/bookings')} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] md:text-xs font-bold tracking-wide hover:bg-white/20 transition-colors shadow-sm w-full text-center backdrop-blur-md border border-white/5">
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
          
          {/* 3. Favorite Arenas (Compact) */}
          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Book It Again</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
              {favoriteArenas.map((arena) => (
                <div key={arena.id} onClick={() => navigate(`/arenas/${arena.id}`)} className={`min-w-[190px] md:min-w-[220px] p-2.5 rounded-2xl border cursor-pointer group transition-all snap-start shadow-sm hover:shadow-md ${
                  isDark ? 'bg-[#12141a] border-white/5 hover:border-[#eb483f]/30' : 'bg-white border-slate-100 hover:border-[#eb483f]/40'
                }`}>
                  <div className="flex gap-2.5 items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img src={arena.image} alt={arena.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className={`text-xs font-bold tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{arena.name}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={9} className="text-[#eb483f] fill-[#eb483f]" />
                        <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>{arena.rating} • {arena.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Active Coaching Combined */}
          <div className="md:col-span-5">
             <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>My Coaching</h3>
             {activeCoaching ? (
               <div className={`p-3.5 md:p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
                 isDark ? 'bg-[#12141a] border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:border-slate-200'
               }`}>
                 <div className="flex gap-3 items-center w-full">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                     <img src={activeCoaching.image} alt="Coach" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between mb-1.5">
                       <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeCoaching.coachName}</h4>
                       <span className={`text-[9px] font-black tracking-wide text-[#eb483f]`}>12/15</span>
                     </div>
                     <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#eb483f] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "80%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className={`h-[68px] md:h-[74px] rounded-2xl border border-dashed flex items-center justify-center p-4 text-center ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                 <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No active coaching</span>
               </div>
             )}
          </div>
        </div>

        {/* PLAYER STATS & SETTINGS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
          
          {/* Quick Stats */}
          <div className="md:col-span-4 flex flex-row md:flex-col gap-3">
            <div className={`flex-1 p-3.5 md:p-4 rounded-2xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
              <div>
                <p className={`text-[9px] uppercase font-bold tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Courts Conquered</p>
                <h4 className={`font-black font-display text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>12</h4>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Trophy size={16} />
              </div>
            </div>
            <div className={`flex-1 p-3.5 md:p-4 rounded-2xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
              <div>
                <p className={`text-[9px] uppercase font-bold tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hours Played</p>
                <h4 className={`font-black font-display text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>38<span className="text-sm">h</span></h4>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
          </div>

          {/* Settings / Navigation List */}
          <div className="md:col-span-8 flex flex-col h-full justify-between">
            <div className={`rounded-2xl border shadow-sm overflow-hidden flex-1 ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-0 transition-colors group ${
                    isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isDark ? 'bg-white/5 text-slate-400 group-hover:text-[#eb483f] group-hover:bg-[#eb483f]/10' : 'bg-slate-100 text-slate-500 group-hover:text-[#eb483f] group-hover:bg-[#eb483f]/10'
                    }`}>
                      <item.icon size={16} />
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                </button>
              ))}
            </div>

            <button 
              onClick={() => navigate('/login')}
              className={`w-full mt-3 px-4 py-3 rounded-2xl border flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest shadow-sm ${
                isDark 
                  ? 'bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10' 
                  : 'bg-white border-red-100 text-red-500 hover:bg-red-50'
              }`}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
  );
};

export default Profile;
