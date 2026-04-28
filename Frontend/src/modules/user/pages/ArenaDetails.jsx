import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MapPin, Star, Wifi, ParkingCircle, Coffee, ShowerHead, CheckCircle, ChevronRight } from 'lucide-react';
import ShuttleButton from '../components/ShuttleButton';
import ArenaProfile from '../../../assets/ArenaProfile.jpeg';
import CourtImage from '../../../assets/court.jpeg';

import { isApiConfigured } from '../../../services/config';
import { fetchPublicArenaById } from '../../../services/arenasApi';
import { normalizeDetailArena } from '../../../utils/arenaAdapter';

const ArenaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [arena, setArena] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isApiConfigured()) {
      setArena(null);
      setLoadError('Set VITE_API_URL to load this arena from the API.');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicArenaById(id);
        if (cancelled) return;
        setArena(normalizeDetailArena(data));
        setLoadError('');
      } catch (e) {
        if (!cancelled) {
          setArena(null);
          setLoadError(e.message || 'Arena not found');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError && !arena) {
    return (
      <div className={`p-10 text-center ${'text-[#CE2029]/40'}`}>
        {loadError}
      </div>
    );
  }

  if (!arena) {
    return <div className={`p-10 text-center ${'text-[#CE2029]/40'}`}>Loading…</div>;
  }

  const heroImage = arena.image && typeof arena.image === 'string' && arena.image.startsWith('http')
    ? arena.image
    : ArenaProfile;

  const amenityIcons = {
    Parking: ParkingCircle,
    Shower: ShowerHead,
    Locker: CheckCircle,
    Cafe: Coffee,
    Wifi: Wifi,
    Water: Coffee,
    'Sports Shop': CheckCircle,
  };

  const courtsList = arena.courts?.length ? arena.courts : [];

  const firstCourt = courtsList[0];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-white'}`}>
      <div className={`absolute top-[400px] -right-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none bg-[#CE2029]/[0.04]`} />
      <div className={`absolute top-[800px] -left-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none bg-[#CE2029]/[0.03]`} />

      <div className="relative h-[380px] overflow-hidden">
        <img src={heroImage} alt={arena.name} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-t ${'from-black/60 via-transparent'} to-transparent`} />
        <div className={`absolute inset-0 bg-gradient-to-b ${'from-black/40'} via-transparent to-transparent`} />

        <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
        </div>

        <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-xl rounded-xl p-3.5 border shadow-xl bg-white/95 border-white/40 shadow-[0_10px_25px_rgba(0,0,0,0.08)]`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-lg font-black font-display text-[#CE2029] tracking-tight uppercase leading-none`}>{arena.name}</h1>
              <div className={`flex items-center text-[10px] mt-1.5 gap-1 text-[#CE2029]/60 font-bold tracking-tight`}>
                <MapPin size={11} strokeWidth={3} />
                {arena.location}
              </div>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-amber-50 border border-amber-100/50">
              <Star size={11} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-xs font-black text-[#CE2029]">{arena.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-7">
        <div>
          <h3 className={`text-base font-bold mb-3 font-display ${'text-[#CE2029]'}`}>About Arena</h3>
          <p className={`text-sm leading-relaxed ${'text-slate-700'}`}>
            {arena.description || 'Premium badminton experience.'}{' '}
            {arena.amenities?.length
              ? `Facilities include ${arena.amenities.join(', ')}.`
              : ''}
          </p>
        </div>

        <div>
          <h3 className={`text-base font-bold mb-4 font-display ${'text-[#CE2029]'}`}>Amenities</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {(arena.amenities || []).map((amenity) => {
              const Icon = amenityIcons[amenity] || CheckCircle;
              return (
                <div key={amenity} className={`flex flex-col items-center justify-center min-w-[75px] h-20 rounded-2xl border transition-all bg-[#CE2029]/5 border-[#CE2029]/10 shadow-sm hover:border-[#CE2029]/40 hover:bg-[#CE2029]/10 group`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white text-[#CE2029] group-hover:scale-110 shadow-sm`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-bold mt-2 transition-all text-[#CE2029] group-hover:text-[#CE2029]`}>{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold font-display ${'text-[#CE2029]'}`}>Select Court</h3>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${'text-slate-400'}`}>{arena.courtsCount} Available</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {courtsList.map((court) => (
              <div
                key={court.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  localStorage.setItem('selectedArena', JSON.stringify({
                    ...arena,
                    selectedCourt: court,
                  }));
                  navigate(`/book/${arena.id}/${court.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    localStorage.setItem('selectedArena', JSON.stringify({
                      ...arena,
                      selectedCourt: court,
                    }));
                    navigate(`/book/${arena.id}/${court.id}`);
                  }
                }}
                className={`p-3.5 rounded-[24px] flex items-center gap-4 cursor-pointer transition-all duration-300 border group ${'bg-white border-slate-100 shadow-[0_4px_20px_rgba(206, 32, 41,0.02)] hover:shadow-[0_8px_30px_rgba(206, 32, 41,0.06)] hover:border-[#CE2029]/20'
                  }`}
              >
                <div className={`w-16 h-16 flex-shrink-0 rounded-[20px] overflow-hidden border transition-transform duration-500 group-hover:scale-105 ${'border-slate-100 shadow-inner'}`}>
                  <img
                    src={court.image || CourtImage}
                    alt=""
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                  />
                </div>

                <div className="flex-1">
                  <h4 className={`font-bold text-base transition-colors ${'text-[#CE2029] group-hover:text-[#CE2029]'}`}>{court.name}</h4>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mt-2 transition-colors ${'bg-[#CE2029]/5 text-[#CE2029]/60 border border-[#CE2029]/10 group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029] group-hover:border-transparent'
                    }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {court.type || 'Court'}
                  </div>
                </div>

                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-[#CE2029]/5 text-[#CE2029]/20 group-hover:bg-[#CE2029] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(206, 32, 41, 0.4)]`}>
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[110] md:max-w-[450px] md:mx-auto">
        <div className={`h-[1px] ${'bg-slate-100'}`} />
        <div className={`backdrop-blur-xl p-4 flex items-center justify-between border-t ${'bg-white/95 border-slate-50 shadow-[0_-10px_30px_rgba(206, 32, 41,0.04)]'}`}>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${'text-[#CE2029]/60'}`}>Starting from</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-display ${'text-[#CE2029]'}`}>OMR {Number(arena.pricePerHour).toFixed(3)}</span>
              <span className={`text-xs ${'text-[#CE2029]/40'}`}>/ hr</span>
            </div>
          </div>
          <ShuttleButton
            variant="primary"
            size="md"
            className="!bg-[#CE2029] !text-white hover:!bg-[#CE2029]/90 hover:shadow-[#CE2029]/20 px-8"
            onClick={() => {
              if (!firstCourt) return;
              localStorage.setItem('selectedArena', JSON.stringify({
                ...arena,
                selectedCourt: firstCourt,
              }));
              navigate(`/book/${arena.id}/${firstCourt.id}`);
            }}
          >
            Book Now
          </ShuttleButton>
        </div>
      </div>
    </div>
  );
};

export default ArenaDetails;
