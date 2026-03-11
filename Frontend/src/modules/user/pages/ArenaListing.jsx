import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, LocationOn, Star, FilterList, ArrowBack } from '@mui/icons-material';
import { ARENAS } from '../../../data/mockData';
import { motion } from 'framer-motion';

const ArenaListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Search Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-50 shadow-sm shadow-slate-200">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <ArrowBack className="text-slate-900" sx={{ fontSize: 20 }} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Choose an Arena</h1>
        </div>

        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search arenas nearby..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#03396C]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm">
            <FilterList sx={{ fontSize: 24 }} />
          </button>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-6">
        {ARENAS.map((arena, index) => (
          <motion.div 
            key={arena.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200 border border-slate-100 group active:scale-[0.98] transition-all"
            onClick={() => navigate(`/arenas/${arena.id}`)}
          >
            <div className="relative h-48 overflow-hidden">
               <img src={arena.image} alt={arena.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-2xl flex items-center space-x-1 shadow-lg">
                 <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                 <span className="text-sm font-bold text-slate-900">{arena.rating}</span>
               </div>
               <div className="absolute bottom-4 left-4 flex space-x-2">
                 {arena.amenities.slice(0, 2).map(amenity => (
                   <span key={amenity} className="px-3 py-1 bg-black/50 backdrop-blur text-white text-[10px] uppercase tracking-wider font-bold rounded-lg border border-white/20">
                     {amenity}
                   </span>
                 ))}
               </div>
            </div>
            <div className="p-6">
               <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-900">{arena.name}</h3>
                  <div className="text-right">
                    <p className="text-[#03396C] font-bold text-lg">₹{arena.pricePerHour}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">per hour</p>
                  </div>
               </div>
               <div className="flex items-center text-slate-400 text-sm mt-2">
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  {arena.location} • {arena.distance}
               </div>
               <div className="mt-6 flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-dashed border-slate-200">
                  <div className="text-center flex-1 border-r border-slate-200">
                    <p className="text-sm font-bold text-slate-900">{arena.courtsCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Courts</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-slate-900">{arena.reviews}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reviews</p>
                  </div>
                  <Link to={`/arenas/${arena.id}`} className="bg-[#03396C] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 flex-1 ml-4 text-center">
                    Book Now
                  </Link>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArenaListing;
