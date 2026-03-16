import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Bell, ChevronRight, Sun, Moon } from 'lucide-react';
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
    <div className={`min-h-screen pb-28 relative transition-colors duration-500 bg-[#FDFBCF]`}>
      <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
        {/* Subtle Green Gradient Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark
          ? 'bg-gradient-to-b from-[#eb483f]/[0.03] via-transparent to-transparent'
          : 'bg-gradient-to-b from-[#eb483f]/[0.1] via-transparent to-transparent'
          }`} />

        {/* Decorative Green Mesh Glows */}
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ${'bg-[#eb483f]/[0.15]'
          }`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full blur-[180px] transition-all duration-1000 ${'bg-blue-50/40'
          }`} />

        {/* Fine Neon Grid for Texture */}
        <div className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${'rgba(235, 72, 63, 0.08)'} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Hero Header Ã¢â‚¬â€ Hidden on Desktop Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <div className="md:hidden">
        <div ref={heroRef} className={`relative px-5 pt-3 pb-3 overflow-hidden bg-[#eb483f] shadow-[0_10px_30px_rgba(235, 72, 63, 0.2)]`}>
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
        {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Featured Banner Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto w-full px-0 md:px-8"
        >
          <MatchBanner promos={promos} />
        </motion.div>

        {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Categories Ã¢â‚¬â€ Sport Cards Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
        <div className="px-4 md:px-8 space-y-4 mt-4">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-black mb-4 font-display text-black tracking-tight"
            >
              What do you want to book?
            </motion.h3>
            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto px-4 md:px-0">
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: sport.delay }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-xl overflow-hidden group cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500"
                >
                  <img src={sport.image} alt={sport.title} className="w-full h-auto block" />
                  
                  {/* Subtle dark overlay on hover to indicate clickability */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Nearby Arenas Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
          {/* Our Events Section */}
          <div className="max-w-7xl mx-auto w-full pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-center mb-6"
            >
              <h3 className="text-lg font-bold font-display text-black">Our Events</h3>
              <Link to="/events" className="text-[#eb483f] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest bg-[#eb483f]/5 px-4 py-2 rounded-full border border-[#eb483f]/30 hover:bg-[#eb483f]/10">
                See all <ChevronRight size={14} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 gap-7 max-w-7xl mx-auto px-4 md:px-0">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="group relative aspect-[4/5] bg-[#0F172A] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                >
                  <img
                    src={event.image}
                    alt="Event Banner"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50" />
                  {/* Tap hint overlay */}
                  <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-[#eb483f] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                      View Details
                    </span>
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




