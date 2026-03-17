import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Bell, ChevronRight, Sun, Moon, Star, MapPin, Zap } from 'lucide-react';
import { ARENAS } from '../../../data/mockData';
import { ShuttlecockIcon, PlayerAvatarIcon } from '../components/BadmintonIcons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableTennisPaddleBall, faBasketball, faFutbol } from '@fortawesome/free-solid-svg-icons';
import ScoreboardSearch from '../components/ScoreboardSearch';
import MatchBanner from '../components/MatchBanner';
import ArenaCard from '../components/ArenaCard';
import EventCard from '../components/EventCard';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';
import Card1 from '../../../assets/Cards/Card1.jpg';
import Card2 from '../../../assets/Cards/Card2.jpg';
import Card3 from '../../../assets/Cards/Card3.jpg';
import Card4 from '../../../assets/Cards/Card4.jpg';
import BadmintonCard from '../../../assets/Category/BadmintonCard.png';
import TennisCard from '../../../assets/Category/TennisCard.png';
import Event1 from '../../../assets/Events/Events1 .jpeg';
import Event2 from '../../../assets/Events/Events2.jpeg';
import Event3 from '../../../assets/Events/Events3.jpeg';

const UserHome = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef(null);
  const lightRef1 = useRef(null);
  const lightRef2 = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  const promos = [
    {
      title: "Join Tournament",
      subtitle: "30% off for new players",
      buttonText: "Join Match",
      image: Card1,
    },
    {
      title: "Book Weekend Slots in Advance",
      subtitle: "Premium Courts Available",
      buttonText: "Book Now",
      image: Card2,
    },
    {
      title: "Join Professional Coaching",
      subtitle: "Learn from the best",
      buttonText: "Learn More",
      image: Card3,
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      image: Event1,
    },
    {
      id: 2,
      image: Event2,
    },
    {
      id: 3,
      image: Event3,
    }
  ];

  // Stadium light streak animation
  useEffect(() => {
    if (lightRef1.current && lightRef2.current) {
      gsap.fromTo(lightRef1.current,
        { x: '-100%', opacity: 0 },
        { x: '300%', opacity: 0.15, duration: 4, ease: 'power1.inOut', repeat: -1, repeatDelay: 2 }
      );
      gsap.fromTo(lightRef2.current,
        { x: '300%', opacity: 0 },
        { x: '-100%', opacity: 0.1, duration: 5, ease: 'power1.inOut', repeat: -1, repeatDelay: 3, delay: 2 }
      );
    }
  }, []);

  return (
    <div className={`min-h-screen pb-28 relative transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-[#FDFBCF]'}`}>
      <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
        {/* Subtle Theme Gradient Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark
          ? 'bg-gradient-to-b from-[#eb483f]/[0.05] via-transparent to-transparent'
          : 'bg-gradient-to-b from-[#eb483f]/[0.1] via-transparent to-transparent'
          }`} />

        {/* Decorative Theme Glows */}
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ${isDark ? 'bg-[#eb483f]/[0.08]' : 'bg-[#eb483f]/[0.15]'
          }`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full blur-[180px] transition-all duration-1000 ${isDark ? 'bg-[#eb483f]/[0.05]' : 'bg-blue-50/40'
          }`} />

        {/* Fine Neon Grid for Texture */}
        <div className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(235, 72, 63, 0.08)'} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ═╦═╦═╦═╦═╦═╦═╦═ Hero Header ── Hidden on Desktop ═╦═╦═╦═╦═╦═╦═╦═ */}
      <div className="md:hidden">
        <div ref={heroRef} className={`relative px-5 pt-3 pb-3 overflow-hidden bg-[#eb483f] shadow-[0_10px_30px_rgba(235, 72, 63, 0.2)]`}>
          {/* Stadium light streaks */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              ref={lightRef1}
              className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-[#fff]/10 to-transparent -skew-x-12"
            />
            <div
              ref={lightRef2}
              className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-[#fff]/5 to-transparent skew-x-12"
            />
          </div>

          {/* Background court pattern */}
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <line x1="200" y1="0" x2="200" y2="200" stroke="#fff" strokeWidth="0.5" opacity="0.1" />
              <rect x="50" y="20" width="300" height="160" rx="4" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08" />
              <line x1="50" y1="100" x2="350" y2="100" stroke="#fff" strokeWidth="0.3" opacity="0.05" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center w-full">
              <div>
                <span
                  style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif", textShadow: "0 0 8px rgba(255, 253, 208, 0.3)" }}
                  className="text-[19px] font-bold tracking-tight uppercase text-[#fffdd0]"
                >
                  AMM Sports Arena
                </span>
              </div>

              {/* Mobile Icons */}
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/profile')} className="relative w-9 h-9 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 transition-all hover:bg-white/10 shadow-sm">
                  <PlayerAvatarIcon size={16} className="text-[#fffdd0]" />
                </button>

                <button onClick={() => navigate('/profile/notifications')} className="relative w-9 h-9 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 transition-all hover:bg-white/10 shadow-sm">
                  <Bell size={16} className="text-[#fffdd0]" />
                  <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#fffdd0] rounded-full shadow-[0_0_5px_#fffdd0]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-0">
        {/* ═╦═╦═╦═╦═╦═╦═╦═ Featured Banner ═╦═╦═╦═╦═╦═╦═╦═ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto w-full px-0 md:px-8 md:pt-10"
        >
          <MatchBanner promos={promos} />
        </motion.div>

        {/* ═╦═╦═╦═╦═╦═╦═╦═ Categories ── Sport Cards ═╦═╦═╦═╦═╦═╦═╦═ */}
        <div className="px-4 md:px-8 space-y-4 md:space-y-6 mt-4 md:mt-12 relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`text-2xl md:text-3xl font-black mb-4 md:mb-6 font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              What do you want to book?
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto px-4 md:px-0">
              {[
                {
                  title: 'Badminton', image: BadmintonCard, delay: 0,
                },
                {
                  title: 'Table Tennis', image: TennisCard, delay: 0.1,
                }
              ].map((sport, i) => (
                <motion.div
                  key={sport.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: sport.delay }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-xl md:rounded-[24px] overflow-hidden group cursor-pointer transition-all duration-500 ${isDark ? 'shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/5' : 'shadow-[0_20px_40px_rgba(235,72,63,0.15)] md:border border-[#eb483f]/10'}`}
                >
                  <img src={sport.image} alt={sport.title} className="w-full h-auto block md:aspect-video md:object-cover md:object-center" />
                  
                  {/* Subtle dark overlay on hover to indicate clickability */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 md:group-hover:bg-black/10 transition-colors duration-300" />
                  
                  {/* Glowing border effect on hover (Desktop) */}
                  <div className="hidden md:block absolute inset-0 border-[3px] border-[#eb483f]/0 group-hover:border-[#eb483f]/60 transition-colors duration-500 rounded-[32px] pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ═╦═╦═╦═╦═╦═╦═╦═ Book Amm Sports Arena CTA (Desktop Only) ═╦═╦═╦═╦═╦═╦═╦═ */}
          <div className="hidden md:block max-w-5xl mx-auto w-full pt-14 px-4 md:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => navigate('/book/1/1')} 
              className={`relative rounded-[32px] overflow-hidden group cursor-pointer border shadow-lg transition-all duration-500 hover:shadow-[0_30px_60px_rgba(235,72,63,0.2)] hover:-translate-y-2 ${
                isDark ? 'bg-[#1a1d24] border-white/10 hover:border-[#eb483f]/50' : 'bg-white border-slate-200 hover:border-[#eb483f]/40'
              }`}
            >
              <div className="flex flex-col md:flex-row h-auto md:h-[280px]">
                {/* Image Section */}
                <div className="w-full md:w-[60%] h-[200px] md:h-full relative overflow-hidden">
                  <img src={ARENAS[0].image} alt={ARENAS[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 md:to-[transparent] md:from-black/60 opacity-60 md:opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-white/50">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-slate-800 font-black text-[12px]">{ARENAS[0].rating} ({ARENAS[0].reviews} Reviews)</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`w-full md:w-[40%] p-8 flex flex-col justify-center relative ${isDark ? 'bg-gradient-to-l from-[#1a1d24] to-[#1a1d24]/90' : 'bg-white'}`}>
                  {/* Glowing background accent on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#eb483f]/0 to-[#eb483f]/0 group-hover:from-[#eb483f]/5 group-hover:to-transparent transition-colors duration-500 rounded-r-[32px] pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/20 mb-4">
                      <Zap size={12} className="fill-[#eb483f]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Premium Wooden Courts</span>
                    </div>
                    
                    <h3 className={`text-3xl font-black font-display tracking-tight leading-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{ARENAS[0].name}</h3>
                    <p className={`text-sm font-medium flex items-center gap-1 mb-6 flex-wrap ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                      <MapPin size={14} /> {ARENAS[0].location} • <span className="text-[#eb483f] font-bold">{ARENAS[0].distance} away</span>
                    </p>

                    <div className="flex gap-2 flex-wrap mb-8">
                      {ARENAS[0].amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Book a slot</p>
                        <p className={`font-black font-display text-2xl leading-none ${isDark ? 'text-[#eb483f]' : 'text-[#eb483f]'}`}>
                          ₹{ARENAS[0].pricePerHour} <span className={`text-xs font-bold ${isDark ? 'text-white/30' : 'text-slate-400'}`}>/hr</span>
                        </p>
                      </div>
                      
                      <button className="px-6 py-3 rounded-xl bg-[#eb483f] text-white text-xs font-black tracking-widest uppercase shadow-[0_8px_20px_rgba(235,72,63,0.3)] group-hover:shadow-[0_12px_25px_rgba(235,72,63,0.4)] transition-all flex items-center gap-2 group-hover:-translate-y-1">
                        Book Now <ChevronRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═╦═╦═╦═╦═╦═╦═╦═ Our Events Section ═╦═╦═╦═╦═╦═╦═╦═ */}
          <div className="max-w-5xl mx-auto w-full pb-4 md:pt-4 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-center md:items-end mb-6 md:mb-6 px-4 md:px-0"
            >
              <div>
                <h3 className={`text-lg md:text-3xl font-bold md:font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Our Events</h3>
                <p className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mt-1 hidden md:block ${isDark ? 'text-white/40' : 'text-[#eb483f]/60'}`}>Join the action</p>
              </div>
              <Link to="/events" className={`font-bold text-xs md:text-sm flex items-center gap-1 hover:gap-1.5 md:hover:gap-2.5 transition-all uppercase tracking-widest px-4 md:px-5 py-2 md:py-2.5 rounded-full border ${isDark ? 'text-[#eb483f] bg-[#eb483f]/10 border-[#eb483f]/20 hover:bg-[#eb483f]/20' : 'text-[#eb483f] bg-[#eb483f]/5 border-[#eb483f]/30 hover:bg-[#eb483f]/10 shadow-sm'}`}>
                See all <ChevronRight size={14} className="md:w-4 md:h-4" />
              </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-5 max-w-5xl mx-auto px-4 md:px-0">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className={`group relative aspect-[4/5] md:aspect-[4/3] bg-[#0F172A] rounded-xl md:rounded-[24px] overflow-hidden cursor-pointer transition-all duration-500 ${isDark ? 'shadow-xl shadow-black/50 border border-white/5 hover:border-[#eb483f]/50' : 'shadow-[0_10px_30px_rgba(235,72,63,0.1)] hover:shadow-[0_20px_40px_rgba(235,72,63,0.2)] md:border border-[#eb483f]/10 hover:border-[#eb483f]/40 md:hover:-translate-y-2'}`}
                >
                  <img
                    src={event.image}
                    alt="Event Banner"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 md:hidden bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50" />
                  
                  {/* Desktop Hover Glow Effect */}
                  <div className="hidden md:block absolute inset-0 bg-[#eb483f]/0 group-hover:bg-[#eb483f]/5 transition-colors duration-500 pointer-events-none" />
                  
                  {/* Glowing inner border effect on hover (Desktop) */}
                  <div className="hidden md:block absolute inset-0 border-[3px] border-[#eb483f]/0 group-hover:border-[#eb483f]/30 transition-colors duration-500 rounded-[24px] pointer-events-none" />

                  {/* Tap hint overlay (subtle for desktop, mainly mobile/hover) */}
                  <div className="absolute inset-0 flex items-end justify-center pb-5 md:pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
