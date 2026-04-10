import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../modules/user/context/ThemeContext';
import CoachSidebar from '../modules/coach/components/CoachSidebar';
import CoachTopbar from '../modules/coach/components/CoachTopbar';
import CoachBottomNav from '../modules/coach/components/CoachBottomNav';

const CoachLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`coach-panel flex h-screen overflow-hidden font-sans transition-colors duration-500 ${isDark ? 'bg-[#0f1115] text-white selection:bg-[#CE2029]/30 selection:text-[#CE2029]' : 'bg-[#FFF1F1] text-[#36454F] selection:bg-[#CE2029]/15 selection:text-[#CE2029]'}`}>
      {/* Background Gradient & Pattern */}
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-opacity duration-500 ${isDark ? 'bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] opacity-100' : 'bg-gradient-to-b from-[#FFF1F1] to-[#FFE4E4] opacity-100'}`} />
      <div className="fixed inset-0 court-lines opacity-[0.03] -z-10 pointer-events-none" />

      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <CoachSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        {/* Topbar */}
        <CoachTopbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide relative px-4 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8 pb-32 md:pb-6 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <CoachBottomNav />
      </div>
    </div>
  );
};

export default CoachLayout;
