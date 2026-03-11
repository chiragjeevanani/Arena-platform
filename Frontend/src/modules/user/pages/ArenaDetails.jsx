import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Star, FavoriteBorder, LocationOn, Groups, Verified, Wifi, LocalParking, LocalCafe, Bathtub } from '@mui/icons-material';
import { ARENAS, COURTS } from '../../../data/mockData';
import { motion } from 'framer-motion';

const ArenaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const arena = ARENAS.find(a => a.id === parseInt(id));

  if (!arena) return <div className="p-10 text-center">Arena not found</div>;

  const amenityIcons = {
    "Parking": <LocalParking sx={{ fontSize: 20 }} />,
    "Shower": <Bathtub sx={{ fontSize: 20 }} />,
    "Locker": <Verified sx={{ fontSize: 20 }} />,
    "Cafe": <LocalCafe sx={{ fontSize: 20 }} />,
    "Wifi": <Wifi sx={{ fontSize: 20 }} />
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Hero Header */}
      <div className="relative h-96 overflow-hidden">
        <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <ArrowBack />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <FavoriteBorder />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 text-white shadow-2xl">
           <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{arena.name}</h1>
                <div className="flex items-center text-white/80 text-sm mt-1">
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  {arena.location}
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-2xl flex items-center space-x-1">
                 <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                 <span className="font-bold">{arena.rating}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">About Arena</h3>
          <p className="text-slate-500 leading-relaxed">
            {arena.description} Premium experience with all modern facilities including {arena.amenities.join(', ')}.
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Amenities</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {arena.amenities.map(amenity => (
              <div key={amenity} className="flex flex-col items-center justify-center min-w-[80px] h-24 bg-slate-50 rounded-3xl border border-slate-100 group transition-all hover:bg-emerald-50 hover:border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#03396C] transition-colors">
                  {amenityIcons[amenity] || <Verified />}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2 group-hover:text-[#03396C]">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Select Court */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Select Court</h3>
          <div className="grid grid-cols-2 gap-4">
             {COURTS.filter(c => c.arenaId === arena.id).map(court => (
               <motion.div 
                 key={court.id}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => navigate(`/book/${arena.id}/${court.id}`)}
                 className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center space-x-4 cursor-pointer hover:border-[#03396C]/30 active:bg-blue-50 transition-all"
               >
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1626224484214-405100cd0e2c?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900">{court.name}</h4>
                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{court.type}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 flex items-center justify-between z-[60] shadow-2xl">
         <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Starting from</p>
            <div className="flex items-center">
               <span className="text-2xl font-bold text-slate-900">₹{arena.pricePerHour}</span>
               <span className="text-slate-400 text-sm ml-1">/ hr</span>
            </div>
         </div>
         <button 
           onClick={() => navigate(`/book/${arena.id}/1`)}
           className="bg-[#03396C] text-white px-10 py-4 rounded-3xl font-bold shadow-xl shadow-blue-100 active:scale-95 transition-all text-base"
         >
           Book Now
         </button>
      </div>
    </div>
  );
};

export default ArenaDetails;
