import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Bell, ChevronRight, Sun, Moon } from 'lucide-react';
import { ARENAS } from '../../../data/mockData';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableTennisPaddleBall, faBasketball, faFutbol } from '@fortawesome/free-solid-svg-icons';
import ScoreboardSearch from '../components/ScoreboardSearch';
import MatchBanner from '../components/MatchBanner';
import ArenaCard from '../components/ArenaCard';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';
import Card1 from '../../../assets/Cards/Card1.jpg';
import Card2 from '../../../assets/Cards/Card2.jpg';
import Card3 from '../../../assets/Cards/Card3.jpg';
import Card4 from '../../../assets/Cards/Card4.jpg';

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
    <div className={`min-h-screen pb-28 relative transition-colors duration-500 ${
      isDark ? 'md:bg-[#FFFDD0]' : 'md:bg-[#FFFDD0]'
    }`}>
      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” THEME-CENTRIC GREEN BACKGROUND (DESKTOP) â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
        {/* Subtle Green Gradient Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          isDark 
            ? 'bg-gradient-to-b from-[#eb483f]/[0.03] via-transparent to-transparent' 
            : 'bg-gradient-to-b from-[#eb483f]/[0.1] via-transparent to-transparent'
        }`} />
        
        {/* Decorative Green Mesh Glows */}
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ${
          isDark ? 'bg-[#eb483f]/[0.04]' : 'bg-[#eb483f]/[0.15]'
        }`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full blur-[180px] transition-all duration-1000 ${
          isDark ? 'bg-[#eb483f]/[0.02]' : 'bg-blue-50/40'
        }`} />

        {/* Fine Neon Grid for Texture */}
        <div className="absolute inset-0 opacity-[0.2]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${isDark ? 'rgba(235, 72, 63, 0.1)' : 'rgba(235, 72, 63, 0.08)'} 1px, transparent 0)`, 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* â•â•â•â•â•â•â• Hero Header â€” Hidden on Desktop â•â•â•â•â•â•â• */}
      <div className="md:hidden">
        <div ref={heroRef} className={`relative px-6 pt-4 pb-4 overflow-hidden ${isDark ? '' : 'bg-[#F3655D] shadow-[0_10px_30px_rgba(10,31,68,0.15)]'}`}>
          {/* Stadium light streaks */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              ref={lightRef1}
              className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-[#eb483f]/20 to-transparent -skew-x-12"
            />
            <div
              ref={lightRef2}
              className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-[#eb483f]/15 to-transparent skew-x-12"
            />
          </div>

          {/* Background court pattern */}
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <line x1="200" y1="0" x2="200" y2="200" stroke="#eb483f" strokeWidth="0.5" opacity="0.1" />
              <rect x="50" y="20" width="300" height="160" rx="4" fill="none" stroke="#eb483f" strokeWidth="0.3" opacity="0.08" />
              <line x1="50" y1="100" x2="350" y2="100" stroke="#eb483f" strokeWidth="0.3" opacity="0.05" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Main Top Row: Logo, Search, and Icons */}
            <div className="flex flex-col gap-4">
              {/* Title & Logo */}
              <div className="flex justify-between items-center w-full">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                    Good Morning
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ShuttlecockIcon size={24} className="text-[#eb483f]" />
                    <span className="text-lg font-black tracking-tight uppercase italic font-display text-white">
                      Badminton Arena
                    </span>
                  </div>
                </div>

                {/* Mobile Icons */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleTheme} className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    {isDark ? <Sun size={18} className="text-[#FFD600]" /> : <Moon size={18} className="text-[#eb483f]" />}
                  </button>
                  <button onClick={() => navigate('/profile/notifications')} className="relative w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <Bell size={18} className="text-white/60" />
                    <div className="absolute top-2.5 right-3 w-2 h-2 bg-[#eb483f] rounded-full" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full">
                <ScoreboardSearch placeholder="Search arenas, courts..." />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-10 mt-1">
        {/* â•â•â•â•â•â•â• Featured Banner â•â•â•â•â•â•â• */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto w-full"
        >
          <MatchBanner promos={promos} />
        </motion.div>

        {/* â•â•â•â•â•â•â• Categories â€” Sport Cards â•â•â•â•â•â•â• */}
        <div className="max-w-7xl mx-auto w-full">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`text-lg font-bold mb-6 font-display ${isDark ? 'text-white/80' : 'text-[#F3655D]/80'}`}
          >
            What do you want to book?
          </motion.h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                title: 'Badminton', icon: ShuttlecockIcon, image: Card1, delay: 0,
                gradient: 'from-purple-900/95 via-purple-600/40',
                hoverBg: 'group-hover:bg-purple-500' 
              },
              { 
                title: 'Table Tennis', icon: faTableTennisPaddleBall, image: Card2, delay: 0.1, isFA: true,
                gradient: 'from-emerald-900/95 via-emerald-600/40',
                hoverBg: 'group-hover:bg-emerald-500'
              },
              { 
                title: 'Basketball', icon: faBasketball, image: Card3, delay: 0.2, isFA: true,
                gradient: 'from-orange-900/95 via-orange-600/40',
                hoverBg: 'group-hover:bg-orange-600'
              },
              { 
                title: 'Football', icon: faFutbol, image: Card4, delay: 0.3, isFA: true,
                gradient: 'from-blue-900/95 via-blue-600/40',
                hoverBg: 'group-hover:bg-blue-600'
              }
            ].map((sport, i) => (
              <motion.div
                key={sport.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: sport.delay }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ backgroundImage: `url(${sport.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                className={`relative p-5 rounded-3xl h-64 flex flex-col items-center justify-end overflow-hidden group cursor-pointer border ${isDark ? 'border-white/10' : 'border-[#F3655D]/8'} shadow-xl transition-all duration-300`}
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${sport.gradient} to-transparent transition-opacity duration-300 group-hover:opacity-80`} />
                
                {/* Floating Icon */}
                <div className="absolute top-6 animate-float z-10">
                  {sport.isFA ? (
                    <FontAwesomeIcon icon={sport.icon} style={{ fontSize: 48 }} className="text-white/90 drop-shadow-2xl" />
                  ) : (
                    <sport.icon size={48} className="text-white/90 drop-shadow-2xl" />
                  )}
                </div>
                
                {/* Court line pattern */}
                <div className="absolute inset-0 court-lines opacity-10 z-10" />

                <div className={`bg-white/10 backdrop-blur-xl border border-white/20 w-full py-3 text-center rounded-2xl font-black text-white text-sm tracking-wider uppercase ${sport.hoverBg} transition-all duration-300 relative z-20 shadow-lg`}>
                  {sport.title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* â•â•â•â•â•â•â• Nearby Arenas â•â•â•â•â•â•â• */}
        <div className="max-w-7xl mx-auto w-full pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-6"
          >
            <h3 className={`text-lg font-bold font-display ${isDark ? 'text-white/80' : 'text-[#F3655D]/80'}`}>Nearby Arenas</h3>
            <Link to="/arenas" className="text-[#eb483f] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest bg-[#eb483f]/10 px-4 py-2 rounded-full border border-[#eb483f]/20">
              See all <ChevronRight size={14} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARENAS.slice(0, 4).map((arena, index) => (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ArenaCard arena={arena} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;


