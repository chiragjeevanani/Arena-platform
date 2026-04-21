import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Search } from 'lucide-react';
import ShuttleButton from '../components/ShuttleButton';
import DesktopNavbar from '../components/DesktopNavbar';
import { isApiConfigured } from '../../../services/config';
import { fetchPublicArenas } from '../../../services/arenasApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';

const ArenaListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [arenas, setArenas] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoadError('Set VITE_API_URL to load arenas from the server.');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicArenas();
        if (cancelled) return;
        setArenas((data.arenas || []).map(normalizeListArena));
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load arenas');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['All', 'Badminton', 'Table Tennis'];

  const filteredArenas = arenas.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-28">
      {/* Header â€” Hidden on Desktop */}
      <div className="md:hidden">
        <div className={`px-4 pt-3 pb-3 sticky top-0 z-50 bg-[#CE2029] border-b border-white/10 rounded-b-3xl shadow-[0_8px_20px_rgba(206, 32, 41,0.15)]`}>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate(-1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border active:scale-95 transition-all bg-white/10 border-white/20 text-white shadow-sm`}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className={`text-base font-bold font-display text-white tracking-tight`}>Choose an Arena</h1>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto w-full relative group">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors text-white/50 group-focus-within:text-white`} />
            <input
              type="text"
              placeholder="Search arenas nearby..."
              className={`w-full border rounded-xl py-1.5 pl-8 pr-3 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white shadow-sm`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 mt-2 scrollbar-hide no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wide font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                  ? 'bg-white text-[#CE2029] shadow-sm'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Arena List */}
      <div className="max-w-5xl mx-auto px-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {loadError && (
          <div className="col-span-full text-center text-sm text-red-600 font-semibold py-6">
            {loadError}
          </div>
        )}
        {!loadError && filteredArenas.length === 0 && (
          <div className="col-span-full text-center text-slate-500 text-sm py-10">
            No arenas published yet. Add one in the admin API and refresh.
          </div>
        )}
        {filteredArenas.map((arena) => (
          <div
            key={arena.id}
            className={`rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 border bg-white border-slate-200 hover:border-[#CE2029]/30 shadow-sm hover:shadow-md`}
            onClick={() => navigate(`/arenas/${arena.id}`)}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={arena.image}
                alt={arena.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#CE2029] via-transparent to-transparent" />

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
                <h3 className={`text-lg font-bold font-display ${'text-[#CE2029]'}`}>{arena.name}</h3>
                <div className="text-right">
                  <p className="text-[#CE2029] font-bold text-lg font-display">OMR {Number(arena.pricePerHour).toFixed(3)}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${'text-[#CE2029]/40'}`}>per hour</p>
                </div>
              </div>

              <div className={`flex items-center text-xs mt-2 gap-1 ${'text-[#CE2029]/70'}`}>
                <MapPin size={13} />
                <span>{arena.location} • {arena.distance}</span>
              </div>

              {/* Stats + CTA */}
              <div className={`mt-5 flex justify-between items-center p-4 rounded-2xl border ${'bg-slate-50 border-slate-200'}`}>
                <div className={`text-center flex-1 border-r ${'border-slate-200'}`}>
                  <p className={`text-sm font-black ${'text-[#CE2029]'}`}>{arena.courtsCount}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${'text-[#CE2029]/50'}`}>Courts</p>
                </div>
                <div className={`text-center flex-1 border-r ${'border-slate-200'}`}>
                  <p className={`text-sm font-black ${'text-[#CE2029]'}`}>{arena.reviews}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${'text-[#CE2029]/50'}`}>Reviews</p>
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



