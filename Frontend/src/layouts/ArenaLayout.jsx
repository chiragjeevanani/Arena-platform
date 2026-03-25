import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ArenaSidebar from '../modules/arena/components/ArenaSidebar';
import ArenaTopbar from '../modules/arena/components/ArenaTopbar';

const ArenaLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="arena-panel flex h-screen overflow-hidden font-sans bg-[#FFF1F1] text-[#0A1F44]">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none -z-20 transition-opacity duration-500 bg-gradient-to-b from-[#FFF1F1] to-[#FFE4E4] opacity-100" />
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Ambient glow - softer for light mode */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-[#eb483f]/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`md:relative fixed inset-y-0 left-0 z-[95] transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ArenaSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        <ArenaTopbar
          isCollapsed={isCollapsed}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide relative font-nunito">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ArenaLayout;
