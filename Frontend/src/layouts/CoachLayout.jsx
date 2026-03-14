import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ClipboardCheck, MessageSquare, LogOut, Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../modules/user/context/ThemeContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const MENU_ITEMS = [
  { path: '/coach', icon: Calendar, label: 'Schedule' },
  { path: '/coach/students', icon: Users, label: 'Students' },
  { path: '/coach/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { path: '/coach/remarks', icon: MessageSquare, label: 'Remarks' },
];

const CoachLayout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    // Add any cleanup/auth state clearing here
    navigate('/admin/login');
  };

  return (
    <div className={`coach-panel flex h-screen overflow-hidden font-sans transition-colors duration-500 ${isDark ? 'bg-[#08142B] text-white selection:bg-[#22FF88]/30 selection:text-[#22FF88]' : 'bg-[#F0F4F8] text-[#0A1F44] selection:bg-[#0A1F44]/15 selection:text-[#0A1F44]'}`}>
      {/* Background Gradient & Pattern */}
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-opacity duration-500 ${isDark ? 'bg-gradient-to-br from-[#08142B] via-[#0A1F44] to-[#08142B] opacity-100' : 'bg-gradient-to-b from-[#F0F4F8] to-[#E8EDF3] opacity-100'}`} />
      <div className="fixed inset-0 court-lines opacity-10 -z-10 pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 h-full backdrop-blur-3xl border-r relative z-20 transition-colors duration-500 ${
        isDark ? 'bg-[#0A1F44]/50 border-[#22FF88]/10' : 'bg-white/80 border-[#0A1F44]/10'
      }`}>
        <div className={`h-20 flex items-center px-6 border-b shrink-0 transition-colors duration-500 ${isDark ? 'border-[#22FF88]/10' : 'border-[#0A1F44]/10'}`}>
          <div className={`font-bold font-display tracking-wide text-xl ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
             COACH<span className="text-[#22FF88]">PORTAL</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/coach'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? `bg-gradient-to-r ${isDark ? 'from-[#22FF88]/20' : 'from-[#22FF88]/10'} to-transparent text-[#22FF88]` 
                    : `${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-[#0A1F44]/60 hover:bg-[#0A1F44]/5 hover:text-[#0A1F44]'}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="coach-active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#22FF88] rounded-r-full shadow-[0_0_10px_#22FF88]"
                    />
                  )}
                  <item.icon size={20} className="shrink-0" />
                  <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className={`p-4 border-t transition-colors duration-500 ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-[#FF4B4B]/80 hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] transition-colors font-semibold text-sm"
           >
             <LogOut size={20} /> Sign out
           </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 backdrop-blur-sm z-40 md:hidden ${isDark ? 'bg-[#08142B]/80' : 'bg-white/80'}`}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`fixed inset-y-0 left-0 w-64 border-r z-50 flex flex-col md:hidden shadow-2xl transition-colors duration-500 ${
              isDark ? 'bg-[#0A1F44] border-[#22FF88]/10' : 'bg-white border-[#0A1F44]/10'
            }`}
          >
             {/* Same content as desktop sidebar */}
             <div className={`h-20 flex items-center px-6 border-b shrink-0 transition-colors duration-500 ${isDark ? 'border-[#22FF88]/10' : 'border-[#0A1F44]/10'}`}>
               <div className={`font-bold font-display tracking-wide text-xl ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                 COACH<span className="text-[#22FF88]">PORTAL</span>
               </div>
             </div>
             <nav className="flex-1 overflow-y-auto p-4 space-y-2">
               {MENU_ITEMS.map((item) => (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   end={item.path === '/coach'}
                   onClick={() => setMobileMenuOpen(false)}
                   className={({ isActive }) =>
                     `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                       isActive 
                         ? `bg-gradient-to-r ${isDark ? 'from-[#22FF88]/20' : 'from-[#22FF88]/10'} to-transparent text-[#22FF88]` 
                         : `${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-[#0A1F44]/60 hover:bg-[#0A1F44]/5 hover:text-[#0A1F44]'}`
                     }`
                   }
                 >
                   <item.icon size={20} className="shrink-0" />
                   <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                 </NavLink>
               ))}
             </nav>
             <div className={`p-4 border-t mt-auto transition-colors duration-500 ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-[#FF4B4B]/80 hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] transition-colors font-semibold text-sm"
                >
                  <LogOut size={20} /> Sign out
                </button>
              </div>
           </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.8)] z-10 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 md:h-20 bg-[#08142B]/90 backdrop-blur-3xl border-b border-[#22FF88]/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 rounded-xl text-white/80 hover:bg-white/5 md:hidden"
          >
            <Menu size={20} className="md:w-[24px] md:h-[24px]" />
          </button>
          
          <div className="hidden md:block" /> {/* spacer */}

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-300 border ${
                isDark 
                  ? 'border-white/10 hover:bg-white/5 text-white/60 hover:text-white' 
                  : 'border-[#0A1F44]/10 hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F44]'
              }`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.4, type: 'spring' }}
              >
                {isDark ? <Sun size={16} className="md:w-[18px] md:h-[18px]" /> : <Moon size={16} className="md:w-[18px] md:h-[18px]" />}
              </motion.div>
            </button>
            <button className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <Bell size={16} className="md:w-[18px] md:h-[18px]" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FFD600] border border-[#08142B]" />
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-2 pr-1 py-0.5 md:py-1 rounded-xl md:rounded-2xl border border-white/5 bg-[#0A1F44]/50">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] md:text-xs font-bold text-white leading-none">Vikram Singh</p>
                <p className="text-[8px] md:text-[10px] font-bold text-[#FFD600] uppercase tracking-wider mt-0.5 md:mt-1">Head Coach</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#FFD600]/20 to-[#FF4B4B]/20 overflow-hidden border border-[#FFD600]/30 selection:bg-transparent">
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide relative z-10 px-4 py-4 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoachLayout;
