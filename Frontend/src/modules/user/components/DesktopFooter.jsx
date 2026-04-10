import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { CourtIcon } from './BadmintonIcons';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const DesktopFooter = () => {
  const { isDark } = useTheme();
  const lightRef1 = useRef(null);
  const lightRef2 = useRef(null);

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
    <footer className={`hidden md:block w-full border-t relative overflow-hidden transition-colors duration-500 z-10 ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-[#CE2029] border-[#CE2029]'}`}>
      
      {/* Stadium light streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={lightRef1}
          className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        />
        <div
          ref={lightRef2}
          className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
        />
      </div>

      {/* Background court pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <line x1="200" y1="0" x2="200" y2="200" stroke={isDark ? '#CE2029' : '#ffffff'} strokeWidth="0.5" opacity="0.3" />
          <rect x="50" y="20" width="300" height="160" rx="4" fill="none" stroke={isDark ? '#CE2029' : '#ffffff'} strokeWidth="0.3" opacity="0.2" />
          <line x1="50" y1="100" x2="350" y2="100" stroke={isDark ? '#CE2029' : '#ffffff'} strokeWidth="0.3" opacity="0.2" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-8 pb-4">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Brand & Intro */}
          <div className="col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${isDark ? 'bg-[#CE2029]' : 'bg-white'}`}>
                <CourtIcon size={16} className={isDark ? 'text-white' : 'text-[#CE2029]'} />
              </div>
              <span className={`text-xl font-black font-display tracking-tight text-white`}>
                Arena<span className={`${isDark ? 'text-[#CE2029]' : 'text-white/80'}`}>Platform</span>
              </span>
            </Link>
            <p className={`text-[11px] leading-relaxed pr-6 ${isDark ? 'text-white/60' : 'text-white/80'}`}>
              The premier destination for booking automated sports courts, joining exclusive tournaments, and receiving professional coaching across all levels of play.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                <a key={idx} href="#" className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:-translate-y-1 ${isDark ? 'bg-white/5 border-white/10 text-white/70 hover:bg-[#CE2029] hover:border-[#CE2029] hover:text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/30 hover:border-white/40 hover:text-white'}`}>
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-2 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-widest text-white`}>Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Explore Arenas', path: '/arenas' },
                { label: 'Upcoming Events', path: '/events' },
                { label: 'Coaching Programs', path: '/coaching' },
                { label: 'My Bookings', path: '/bookings' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className={`text-[11px] font-medium transition-colors ${isDark ? 'text-white/60 hover:text-[#CE2029]' : 'text-white/70 hover:text-white'}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-2 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-widest text-white`}>Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Help Center', path: '#' },
                { label: 'Terms of Service', path: '#' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Cancellation Policy', path: '#' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className={`text-[11px] font-medium transition-colors ${isDark ? 'text-white/60 hover:text-[#CE2029]' : 'text-white/70 hover:text-white'}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-4 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-widest text-white`}>Contact Us</h4>
            <div className="space-y-3">
              <div className={`flex items-start gap-3 p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/10 border-white/20'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#CE2029]/20 text-[#CE2029]' : 'bg-white/20 text-white'}`}>
                  <MapPin size={14} />
                </div>
                <div>
                  <h5 className={`text-[11px] font-bold mb-0.5 text-white`}>Headquarters</h5>
                  <p className={`text-[10px] leading-relaxed ${isDark ? 'text-white/50' : 'text-white/70'}`}>123 Sports Avenue, Athletic District<br/>Metropolis, NY 10001</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white/10 border-white/20 hover:bg-white/20'} transition-colors cursor-pointer`}>
                  <Phone size={14} className={isDark ? 'text-[#CE2029]' : 'text-white'} />
                  <span className={`text-[10px] font-bold ${isDark ? 'text-white/80' : 'text-white'}`}>+1 (800) 123-4567</span>
                </div>
                <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white/10 border-white/20 hover:bg-white/20'} transition-colors cursor-pointer`}>
                  <Mail size={14} className={isDark ? 'text-[#CE2029]' : 'text-white'} />
                  <span className={`text-[10px] font-bold ${isDark ? 'text-white/80' : 'text-white'}`}>hello@arena.co</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className={`mt-8 pt-4 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-white/20'}`}>
          <p className={`text-[10px] font-medium ${isDark ? 'text-white/40' : 'text-white/60'}`}>
            &copy; {new Date().getFullYear()} Arena Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-white/10 border-white/20 text-white/80'}`}>
              Secure Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DesktopFooter;
