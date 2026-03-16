import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Search } from 'lucide-react';
import { ARENAS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const ArenaListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toggleTheme } = useTheme();
  const isDark = false; // Forced for removal of dark mode

  const categories = ['All', 'Badminton', 'Football', 'Squash', 'Tennis'];

  const filteredArenas = ARENAS.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-28">
      {/* Header â€” Hidden on Desktop */}
      <div className="md:hidden">
        <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b ${'bg-[#eb483f] border-white/10 rounded-b-[30px] shadow-[0_10px_30px_rgba(10,31,68,0.15)]'}`}>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${'bg-white/10 border-white/20 text-white shadow-sm'}`}
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className={`text-lg font-bold font-display ${'text-white'}`}>Choose an Arena</h1>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto w-full relative group">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/25 group-focus-within:text-[#eb483f]' : 'text-white/40 group-focus-within:text-[#eb483f]'}`} />
            <input
              type="text"
              placeholder="Search arenas nearby..."
              className={`w-full border rounded-2xl py-3 pl-11 pr-4 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#eb483f]/20 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#eb483f] backdrop-blur-md`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-hide no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                  ? 'bg-white text-[#eb483f] shadow-lg scale-105'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Desktop Navigation */}
          <DesktopNavbar />
        </div>
      </div>

      {/* Arena List */}
      <div className="max-w-5xl mx-auto px-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {filteredArenas.map((arena, index) => (
          <div
            key={arena.id}
            className={`rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 border bg-white border-slate-200 hover:border-[#eb483f]/30 shadow-sm hover:shadow-md`}
            onClick={() => navigate(`/arenas/${arena.id}`)}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={arena.image}
                alt={arena.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#eb483f] via-transparent to-transparent" />

              <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Star size={13} className="text-[#FFD600] fill-[#FFD600]" />
                <span className="text-xs font-bold text-white">{arena.rating}</span>
              </div>

              {/* Amenity badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {arena.amenities.slice(0, 2).map(amenity => (
                  <span key={amenity} className="px-2.5 py-1 glass text-white text-[9px] uppercase tracking-wider font-bold rounded-lg">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className={`text-lg font-bold font-display ${'text-[#eb483f]'}`}>{arena.name}</h3>
                <div className="text-right">
                  <p className="text-[#eb483f] font-bold text-lg font-display">₹{arena.pricePerHour}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${'text-[#eb483f]/40'}`}>per hour</p>
                </div>
              </div>

              <div className={`flex items-center text-xs mt-2 gap-1 ${'text-[#eb483f]/70'}`}>
                <MapPin size={13} />
                <span>{arena.location} • {arena.distance}</span>
              </div>

              {/* Stats + CTA */}
              <div className={`mt-5 flex justify-between items-center p-4 rounded-2xl border ${'bg-slate-50 border-slate-200'}`}>
                <div className={`text-center flex-1 border-r ${'border-slate-200'}`}>
                  <p className={`text-sm font-black ${'text-[#eb483f]'}`}>{arena.courtsCount}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${'text-[#eb483f]/50'}`}>Courts</p>
                </div>
                <div className={`text-center flex-1 border-r ${'border-slate-200'}`}>
                  <p className={`text-sm font-black ${'text-[#eb483f]'}`}>{arena.reviews}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${'text-[#eb483f]/50'}`}>Reviews</p>
                </div>
                <div className="flex-1 ml-3">
                  <ShuttleButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); navigate(`/arenas/${arena.id}`); }}
                  >
                    Book Now
                  </ShuttleButton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArenaListing;



