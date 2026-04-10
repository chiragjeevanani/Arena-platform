import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Star, Plus, 
  ChevronRight, Search, Filter, 
  Target, Users, ArrowLeft
} from 'lucide-react';
import { ARENAS } from '../../../data/mockData';

const ArenaListAdmin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = ARENAS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto px-4 py-4 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
           <button 
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#CE2029] hover:bg-[#CE2029]/5 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
             <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#CE2029] mb-1">
                <Building2 size={12} /> Management Portal
             </div>
             <h1 className="text-xl font-semibold tracking-tight text-slate-900">Facility Registry</h1>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin/arena/details/new')}
          className="bg-[#CE2029] text-white px-5 py-2 rounded-lg font-semibold text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
        >
           <Plus size={14} /> Add New Arena
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative group w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search active arenas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-100 bg-white outline-none focus:border-[#CE2029] transition-all font-semibold shadow-sm" 
          />
        </div>
        <button className="p-2.5 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#CE2029] transition-all shadow-sm">
          <Filter size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pt-4">
        {filtered.map((arena) => (
          <motion.div
            key={arena.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate(`/admin/arena/details/${arena.id}`)}
            className="group bg-white rounded-sm border border-slate-100 p-2.5 shadow-sm hover:shadow-lg hover:border-[#CE2029]/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-fit"
          >
            {/* Image Header */}
            <div className="relative h-28 rounded-sm overflow-hidden mb-2.5 bg-slate-50 border border-slate-50">
              <img src={arena.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
              <div className="absolute top-1.5 right-1.5 bg-[#CE2029] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Star size={9} className="text-[#FFD600] fill-[#FFD600]" />
                <span className="text-[9px] font-black text-white">{arena.rating}</span>
              </div>
              <div className="absolute bottom-1.5 left-1.5 flex gap-1 font-bold">
                 <span className="bg-white px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-wider text-[#CE2029] font-black shadow-sm">
                   {arena.category}
                 </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <h3 className="text-[13px] font-black text-slate-900 group-hover:text-[#CE2029] transition-all truncate tracking-tight uppercase">
                  {arena.name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                  <MapPin size={9} className="text-[#CE2029]/60" />
                  <span className="text-[9px] font-bold truncate opacity-80">{arena.location}</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-1.5 py-2 border-y border-slate-50 px-1">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-sm bg-[#CE2029]/5 flex items-center justify-center text-[#CE2029]/70">
                      <Target size={10} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-900 leading-none">{arena.courtsCount}</p>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Courts</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-sm bg-green-50 flex items-center justify-center text-green-500/70">
                      <Users size={10} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-900 leading-none">{arena.reviews}</p>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Reviews</p>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div>
                   <span className="text-[#CE2029] text-[11px] font-black tracking-tight">OMR {Number(arena.pricePerHour).toFixed(3)}</span>
                   <span className="text-[7px] text-slate-300 font-black uppercase ml-1 tracking-widest">/hr</span>
                </div>
                <button className="w-6 h-6 rounded-sm bg-slate-50 text-slate-200 group-hover:bg-[#CE2029] group-hover:text-white transition-all flex items-center justify-center border border-slate-100">
                  <ChevronRight size={12} strokeWidth={4} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Dash Card for Add - Removed aspect-square to avoid stretching */}
        <div 
          onClick={() => navigate('/admin/arena/details/new')}
          className="rounded-sm border-2 border-dashed border-slate-100 flex flex-col items-center justify-center py-8 gap-2.5 text-slate-300 hover:border-[#CE2029]/40 bg-slate-50/50 hover:bg-[#CE2029]/[0.02] group transition-all cursor-pointer h-[230px]"
        >
          <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center shadow-sm group-hover:scale-105 shadow-slate-100 transition-all border border-slate-100">
            <Plus size={18} className="text-[#CE2029]" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.12em] text-center px-6 leading-relaxed">Commission New Portfolio Unit</span>
        </div>
      </div>
    </div>
  );
};

export default ArenaListAdmin;
