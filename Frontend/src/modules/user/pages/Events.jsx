import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BadmintonBanner from '../../../assets/Events/Badminton.png';
import TableTennisBanner from '../../../assets/Events/TableTennis.png';
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

      {/* Header */}
      <div className="bg-[#eb483f] px-6 py-5 shadow-lg border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-xl active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>OUR EVENTS</h1>
            <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase mt-0.5">Explore Upcoming Activities</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-20 relative z-10">
        {/* Filter Tags - Compact single line */}
        <div className="flex flex-row items-center gap-2 mb-8">
          {['All', 'Badminton', 'Table Tennis'].map((tag) => (
            <button 
              key={tag} 
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-2.5 rounded-2xl text-[11px] font-black tracking-tight transition-all active:scale-95 duration-300 ${
                selectedTag === tag
                  ? 'bg-[#eb483f] text-white shadow-xl shadow-[#eb483f]/30'
                  : 'bg-white text-slate-500 border border-slate-100 font-bold hover:border-[#eb483f]/30 hover:text-[#eb483f]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Banners Grid */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredBanners.map((banner) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#eb483f]/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white bg-white/50 backdrop-blur-sm">
                  <img 
                    src={banner.image} 
                    alt={banner.category} 
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  {/* Subtle glass overlay on image bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#eb483f]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredBanners.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
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
