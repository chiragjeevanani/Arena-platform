import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { isApiConfigured } from '../../../services/config';
import { fetchPublishedEvents } from '../../../services/eventsApi';
import { normalizeCmsEventForList } from '../../../utils/eventAdapter';

const Events = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState('All');
  const [apiBanners, setApiBanners] = useState([]);
  const [loadState, setLoadState] = useState('idle');

  useEffect(() => {
    if (!isApiConfigured()) {
      setApiBanners([]);
      setLoadState('skipped');
      return undefined;
    }
    let cancelled = false;
    setLoadState('loading');
    (async () => {
      try {
        const data = await fetchPublishedEvents();
        if (cancelled) return;
        const rows = (data.contents || []).map(normalizeCmsEventForList);
        setApiBanners(rows);
        setLoadState('ok');
      } catch {
        if (!cancelled) {
          setApiBanners([]);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const banners = apiBanners;

  const filterTags = useMemo(() => {
    const cats = new Set(banners.map((b) => b.category).filter(Boolean));
    const ordered = ['All', 'Badminton', 'Table Tennis', 'General'].filter(
      (t) => t === 'All' || cats.has(t)
    );
    const extras = [...cats].filter((c) => !ordered.includes(c));
    return [...ordered, ...extras.sort()];
  }, [banners]);

  const filteredBanners =
    selectedTag === 'All' ? banners : banners.filter((banner) => banner.category === selectedTag);

  return (
    <div className="min-h-screen bg-[#FFF1F1] pb-24 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-[#CE2029]/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-10 left-[-5%] w-[250px] h-[250px] bg-[#CE2029]/5 rounded-full blur-[80px]" />

      <div className="md:hidden">
        <div className={`px-4 pt-4 pb-4 backdrop-blur-2xl border-b border-white/10 bg-[#CE2029] rounded-b-3xl shadow-[0_10px_30px_rgba(206, 32, 41,0.15)]`}>
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold font-display text-white tracking-tight uppercase">Our Events</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5 md:pt-16 pb-20 relative z-10">
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 items-center gap-6 mb-10 md:mb-12">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white flex items-center justify-center border border-slate-100 text-[#CE2029] shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-95 transition-all hover:shadow-md"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#CE2029] tracking-tight uppercase" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>OUR EVENTS</h1>
              <p className="text-[9px] md:text-[10px] text-[#CE2029]/60 font-black tracking-[0.3em] uppercase mt-0.5">Explore Upcoming Activities</p>
            </div>
          </div>

          <div className="flex flex-row items-center justify-center gap-2 flex-wrap">
            {filterTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black tracking-tight transition-all active:scale-95 duration-300 ${
                  selectedTag === tag
                    ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                    : 'bg-white border border-slate-100 text-[#36454F] hover:border-[#CE2029]/30 hover:text-[#CE2029]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="flex md:hidden flex-row items-center justify-center gap-2 flex-wrap mb-5">
          {filterTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-tight transition-all active:scale-95 duration-300 ${
                selectedTag === tag
                  ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                  : 'bg-white text-slate-800 border border-slate-100 font-bold'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loadState === 'loading' && (
          <p className="text-center text-sm font-bold text-[#CE2029]/70 mb-6">Loading events…</p>
        )}
        {loadState === 'error' && isApiConfigured() && (
          <p className="text-center text-sm font-bold text-slate-500 mb-6">Could not load events. Check the API and try again.</p>
        )}

        {loadState === 'skipped' && (
          <p className="text-center text-sm font-bold text-slate-500 mb-6">
            Set <span className="font-mono">VITE_API_URL</span> to load published events from the server.
          </p>
        )}

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
                <div className="absolute inset-0 bg-[#CE2029]/20 rounded-[24px] md:rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white bg-white/50 backdrop-blur-sm aspect-[4/5] md:aspect-square lg:aspect-[4/5]">
                  <img
                    src={banner.image}
                    alt={banner.title || banner.category}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#CE2029]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#CE2029] shadow-sm border border-white/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {banner.category}
                  </div>
                  {banner.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                      <p className="text-white font-black text-sm tracking-tight line-clamp-2">{banner.title}</p>
                    </div>
                  )}
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
