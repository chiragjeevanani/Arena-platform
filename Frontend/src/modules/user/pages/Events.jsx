import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BadmintonBanner from '../../../assets/Events/Badminton1.jpg';
import TableTennisBanner from '../../../assets/Events/Tabletennis1.jpg';
import Event1 from '../../../assets/Events/Events1 .jpeg';
import Event2 from '../../../assets/Events/Events2.jpeg';
import Event3 from '../../../assets/Events/Events3.jpeg';

const Events = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState('All');

  const banners = [
    {
      id: 3,
      image: Event1,
      category: 'General'
    },
    {
      id: 4,
      image: Event2,
      category: 'General'
    },
    {
      id: 5,
      image: Event3,
      category: 'General'
    },
    {
      id: 1,
      image: BadmintonBanner,
      category: 'Badminton'
    },
    {
      id: 2,
      image: TableTennisBanner,
      category: 'Table Tennis'
    }
  ];

  const filteredBanners = selectedTag === 'All' 
    ? banners 
    : banners.filter(banner => banner.category === selectedTag);

  return (
    <div className="min-h-screen bg-[#FFF1F1] pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-[#eb483f]/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-10 left-[-5%] w-[250px] h-[250px] bg-[#eb483f]/5 rounded-full blur-[80px]" />

      {/* Mobile-Only Red Header */}
      <div className="md:hidden">
        <div className={`px-4 pt-4 pb-4 backdrop-blur-2xl border-b border-white/10 bg-[#eb483f] rounded-b-3xl shadow-[0_10px_30px_rgba(235,72,63,0.15)]`}>
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold font-display text-white tracking-tight uppercase">Our Events</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pt-5 md:pt-16 pb-20 relative z-10">
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 items-center gap-6 mb-10 md:mb-12">
          {/* 1. Left: Title & Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white flex items-center justify-center border border-slate-100 text-[#eb483f] shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-95 transition-all hover:shadow-md"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#eb483f] tracking-tight uppercase" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>OUR EVENTS</h1>
              <p className="text-[9px] md:text-[10px] text-[#eb483f]/60 font-black tracking-[0.3em] uppercase mt-0.5">Explore Upcoming Activities</p>
            </div>
          </div>

          {/* 2. Center: Filter Tags */}
          <div className="flex flex-row items-center justify-center gap-2">
            {['All', 'Badminton', 'Table Tennis'].map((tag) => (
              <button 
                key={tag} 
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black tracking-tight transition-all active:scale-95 duration-300 ${
                  selectedTag === tag
                    ? 'bg-[#eb483f] text-white shadow-lg shadow-[#eb483f]/20'
                    : 'bg-white text-slate-500 border border-slate-100 font-bold hover:border-[#eb483f]/30 hover:text-[#eb483f]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 3. Right: Spacer for centering */}
          <div className="hidden lg:block" />
        </div>

        {/* Mobile Filter Tags Row - Visible only on mobile since desktop one is hidden */}
        <div className="flex md:hidden flex-row items-center justify-center gap-2 mb-5">
          {['All', 'Badminton', 'Table Tennis'].map((tag) => (
            <button 
              key={tag} 
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-tight transition-all active:scale-95 duration-300 ${
                selectedTag === tag
                  ? 'bg-[#eb483f] text-white shadow-lg shadow-[#eb483f]/20'
                  : 'bg-white text-slate-500 border border-slate-100 font-bold'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Recent Results Banner (Mock Implementation matching Admin) */}
        {selectedTag === 'All' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 w-full rounded-[20px] md:rounded-[32px] overflow-hidden relative shadow-xl shadow-[#eb483f]/10 border border-white bg-white backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#eb483f]/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-8 items-center relative z-10">
              {/* Left Side: Event Title & Trophy */}
              <div className="flex-1 text-center md:text-left">
                 <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-[#eb483f]/10 text-[#eb483f] mb-2 md:mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.5,1.7,4.6,4,5.3V15c0,1.1,0.9,2,2,2h2v4H9v2h6v-2h-2v-4h2c1.1,0,2-0.9,2-2v-1.7 c2.3-0.6,4-2.8,4-5.3V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.8C5.8,10.4,5,9.3,5,8z M19,8c0,1.3-0.8,2.4-2,2.8V7h2V8z"/></svg>
                 </div>
                 <p className="text-[#eb483f] font-black tracking-[0.2em] text-[9px] md:text-[10px] uppercase mb-0.5">Results Declared</p>
                 <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight uppercase leading-tight mb-1.5 md:mb-2">Summer Badminton Smash 2026</h2>
                 <p className="text-[11px] md:text-sm font-semibold text-slate-500 max-w-[280px] mx-auto md:mx-0 leading-snug">The official leaderboard has been published by the administration.</p>
              </div>

              {/* Right Side: Podium */}
              <div className="flex-1 w-full bg-slate-50/50 rounded-2xl p-3 md:p-6 border border-slate-100/50 flex flex-col gap-2 md:gap-3">
                 {/* Winner */}
                 <div className="flex items-center gap-3 md:gap-4 bg-white p-2.5 md:p-3 rounded-xl shadow-sm border border-yellow-400/30">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-yellow-400/20 text-yellow-600 flex items-center justify-center font-black text-sm md:text-lg">A</div>
                    <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] font-black tracking-widest text-yellow-500 uppercase leading-none mb-0.5">Gold Medalist</p>
                      <p className="text-xs md:text-sm font-black text-slate-800 leading-none">Anjali Varma</p>
                    </div>
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.5,1.7,4.6,4,5.3V15c0,1.1,0.9,2,2,2h2v4H9v2h6v-2h-2v-4h2c1.1,0,2-0.9,2-2v-1.7 c2.3-0.6,4-2.8,4-5.3V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.8C5.8,10.4,5,9.3,5,8z M19,8c0,1.3-0.8,2.4-2,2.8V7h2V8z"/></svg>
                 </div>
                 {/* Runner Up */}
                 <div className="flex items-center gap-3 md:gap-4 bg-white p-2.5 md:p-3 rounded-xl shadow-sm border border-slate-300/50">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center font-black text-sm md:text-lg">R</div>
                    <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-0.5">Silver Medalist</p>
                      <p className="text-xs md:text-sm font-black text-slate-800 leading-none">Rahul Sharma</p>
                    </div>
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-300 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.5,1.7,4.6,4,5.3V15c0,1.1,0.9,2,2,2h2v4H9v2h6v-2h-2v-4h2c1.1,0,2-0.9,2-2v-1.7 c2.3-0.6,4-2.8,4-5.3V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.8C5.8,10.4,5,9.3,5,8z M19,8c0,1.3-0.8,2.4-2,2.8V7h2V8z"/></svg>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredBanners.map((banner) => (
              <motion.div
                key={banner.id}
                onClick={() => navigate(`/events/${banner.id}`)}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#eb483f]/20 rounded-[24px] md:rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white bg-white/50 backdrop-blur-sm aspect-[4/5] md:aspect-square lg:aspect-[4/5]">
                  <img 
                    src={banner.image} 
                    alt={banner.category} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle glass overlay on image bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#eb483f]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Category Badge on card */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#eb483f] shadow-sm border border-white/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {banner.category}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredBanners.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <p className="text-slate-400 font-bold">No events found for this category</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
