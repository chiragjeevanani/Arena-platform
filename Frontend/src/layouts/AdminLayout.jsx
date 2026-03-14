import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../modules/admin/components/AdminSidebar';
import AdminTopbar from '../modules/admin/components/AdminTopbar';
import { useTheme } from '../modules/user/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`admin-panel flex h-screen overflow-hidden font-sans transition-colors duration-500 ${isDark ? 'bg-[#08142B] text-white selection:bg-[#22FF88]/30 selection:text-[#22FF88]' : 'bg-[#F0F4F8] text-[#0A1F44] selection:bg-[#0A1F44]/15 selection:text-[#0A1F44]'}`}>
      {/* Background Gradient & Pattern */}
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-opacity duration-500 ${isDark ? 'bg-gradient-to-br from-[#08142B] via-[#0A1F44] to-[#08142B] opacity-100' : 'bg-gradient-to-b from-[#F0F4F8] to-[#E8EDF3] opacity-100'}`} />
      <div className="fixed inset-0 court-lines opacity-10 -z-10 pointer-events-none" />

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`md:relative fixed inset-y-0 left-0 z-[95] transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        {/* Topbar */}
        <AdminTopbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide relative px-4 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
