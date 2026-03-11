import { useState, useEffect } from 'react';
import { Search, Notifications, ArrowForward, HelpOutline, Logout, Star, LocationOn, KeyboardArrowDown, Tune, SportsScore, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ARENAS } from '../../../data/mockData';

const UserHome = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const promos = [
    {
      title: "Get 30% off for new members",
      buttonText: "Join Now",
      image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=800&auto=format&fit=crop",
      color: "from-[#03396C]/90"
    },
    {
      title: "Book Weekend Slots in Advance",
      buttonText: "Book Now",
      image: "https://images.unsplash.com/photo-1626224484214-405100cd0e2c?q=80&w=800&auto=format&fit=crop",
      color: "from-[#1e5a9e]/90"
    },
    {
      title: "Join Professional Coaching",
      buttonText: "Learn More",
      image: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=800&auto=format&fit=crop",
      color: "from-[#012140]/90"
    }
  ];

  useEffect(() => {
    // Auto-play removed as per user request
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % promos.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);

  return (
    <div className="bg-white min-h-screen pb-24 font-sans">
      {/* Dynamic Header Case: Image Layout */}
      <div className="bg-[#03396C] px-6 pt-12 pb-10 sticky top-0 z-50 shadow-xl rounded-b-[40px] text-white overflow-hidden">
        {/* Subtle Background Pattern (Waves) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 Q 100 0, 200 50 T 400 50" fill="none" stroke="white" strokeWidth="2" />
            <path d="M0 80 Q 100 30, 200 80 T 400 80" fill="none" stroke="white" strokeWidth="2" />
            <path d="M0 110 Q 100 60, 200 110 T 400 110" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col space-y-6">
          {/* Top Row: Location & Notification */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                {isLoggedIn ? "Location" : "Good Morning"}
              </p>
              <div 
                className="flex items-center space-x-1 cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => !isLoggedIn && setIsLoggedIn(true)}
              >
                {isLoggedIn ? (
                  <>
                    <LocationOn sx={{ fontSize: 18 }} />
                    <span className="text-sm font-bold">New York, USA</span>
                    <KeyboardArrowDown sx={{ fontSize: 18 }} />
                  </>
                ) : (
                  <>
                    <SportsScore sx={{ fontSize: 18 }} />
                    <span className="text-lg font-black tracking-tight uppercase italic">Badminton Arena</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="relative">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-sm transition-transform active:scale-90">
                  <Notifications sx={{ fontSize: 22 }} />
                  <div className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#03396C]" />
                </div>
              </div>
              {isLoggedIn && (
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-sm transition-transform active:scale-95"
                >
                  <Logout sx={{ fontSize: 20 }} />
                </button>
              )}
            </div>
          </div>

          {/* User Name (Optional, if logged in show below location) */}
          {isLoggedIn && (
            <div className="pt-2 animate-fade-in">
              <h2 className="text-2xl font-black text-white leading-tight">Hi, Muhammad Haroos</h2>
            </div>
          )}

          {/* Search Row */}
          <div className="flex space-x-3 pt-2">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#03396C] transition-colors">
                <Search sx={{ fontSize: 22 }} />
              </div>
              <input 
                type="text" 
                placeholder="Search Here" 
                className="w-full bg-white text-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-2xl placeholder:text-slate-400 focus:ring-0"
              />
            </div>
            <button className="w-14 bg-white text-[#03396C] rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all">
              <Tune sx={{ fontSize: 24 }} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-6">
        {/* Promo Carousel */}
        <div className="relative h-48 rounded-[35px] overflow-hidden shadow-2xl shadow-blue-100 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={promos[currentSlide].image}
                alt="Promo"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${promos[currentSlide].color} to-transparent p-8 flex flex-col justify-center`}>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white text-2xl font-black max-w-[220px] leading-tight"
                >
                  {promos[currentSlide].title}
                </motion.h2>
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-5 bg-white text-[#03396C] px-8 py-3 rounded-2xl font-black text-sm w-fit shadow-xl active:scale-95 transition-all"
                >
                  {promos[currentSlide].buttonText}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 z-30 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft sx={{ fontSize: 20 }} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 z-30 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight sx={{ fontSize: 20 }} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {promos.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6">What do you want to book?</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-fuchsia-600 to-indigo-600 p-4 rounded-[28px] relative h-40 flex flex-col items-center justify-end shadow-lg shadow-indigo-100 group transition-all">
              <div className="absolute top-4 flex space-x-[-15px]">
                <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-2 border-white/50" alt="" />
                <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-2 border-white/50" alt="" />
              </div>
              <div className="bg-white w-full py-2 text-center rounded-2xl font-bold text-slate-800 shadow-xl group-hover:scale-105 transition-all">
                Badminton
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 rounded-[28px] relative h-40 flex flex-col items-center justify-end shadow-lg shadow-cyan-100 group transition-all">
              <div className="bg-white w-full py-2 text-center rounded-2xl font-bold text-slate-800 shadow-xl group-hover:scale-105 transition-all">
                Table Tennis
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Arenas */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Nearby Arenas</h3>
            <Link to="/arenas" className="text-[#03396C] font-bold text-sm flex items-center">
              See all <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
            </Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {ARENAS.map((arena) => (
              <motion.div
                key={arena.id}
                whileTap={{ scale: 0.98 }}
                className="min-w-[280px] bg-slate-50/50 rounded-[32px] p-4 border border-slate-100 shadow-sm"
              >
                <div className="relative h-40 rounded-[24px] overflow-hidden">
                  <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-xl flex items-center space-x-1 shadow-sm">
                    <Star sx={{ fontSize: 14, color: '#fbbf24' }} />
                    <span className="text-xs font-bold text-slate-800">{arena.rating}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h4 className="font-bold text-slate-900 text-lg">{arena.name}</h4>
                  <div className="flex items-center text-slate-400 text-xs">
                    <LocationOn sx={{ fontSize: 12, mr: 0.5 }} />
                    {arena.location} • {arena.distance}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[#03396C] font-bold text-lg">₹{arena.pricePerHour}</span>
                      <span className="text-slate-400 text-xs"> / hour</span>
                    </div>
                    <Link to={`/arenas/${arena.id}`} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all">
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
