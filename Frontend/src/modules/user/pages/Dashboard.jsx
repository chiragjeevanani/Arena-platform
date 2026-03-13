import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import { USER_BOOKINGS } from '../../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import BookingTimelineCard from '../components/BookingTimeline';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { isDark } = useTheme();
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    // Merge mock bookings with user booked arenas from localStorage
    const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const merged = [...savedBookings, ...USER_BOOKINGS];

    // Sort by date (mock sorting)
    setAllBookings(merged);
  }, []);

  const tabs = [
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'past', name: 'Past' },
    { id: 'coaching', name: 'Coaching' },
    { id: 'payments', name: 'Receipts' },
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${isDark ? 'bg-[#08142B]' : 'bg-[#F8FAFC]'}`}>
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Premium Dark Style */}
      {/* Header - Desktop Hidden Logo/Nav Row */}
      <div className="md:hidden">
        <div className={`px-6 pt-6 pb-4 backdrop-blur-2xl border-b border-white/10 bg-[#0F172A] rounded-b-[40px] shadow-[0_15px_40px_rgba(15,23,42,0.25)]`}>
          <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg active:scale-95 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-bold font-display text-white tracking-tight">My Bookings</h1>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#22FF88]/10 border border-[#22FF88]/20 flex items-center justify-center text-[#22FF88]">
              <Receipt size={20} />
            </div>
          </div>
          <DesktopNavbar />
        </div>
      </div>

      {/* Tabs Row - Visible on both but styled for desktop consistency */}
      <div className="px-6 py-4 md:py-8 sticky top-0 md:top-[74px] z-[50] backdrop-blur-xl md:backdrop-blur-none">
        <div className="max-w-md mx-auto flex gap-1.5 p-1.5 rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-1 rounded-[16px] text-[9px] font-black uppercase tracking-wider transition-all duration-500 relative z-10 ${activeTab === tab.id
                  ? 'bg-gradient-to-br from-[#22FF88] to-[#22dd77] text-[#0A1F44] shadow-[0_5px_15px_rgba(34,255,136,0.3)]'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {allBookings.filter(b => b.status === 'Upcoming' && b.type !== 'Coaching').length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allBookings.filter(b => b.status === 'Upcoming' && b.type !== 'Coaching').map((booking, index) => (
                    <BookingTimelineCard key={booking.id} booking={booking} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-10">
                  <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-6">
                    <Receipt size={32} className="text-[#22FF88]/20" />
                  </div>
                  <h3 className={`text-lg font-black font-display ${isDark ? 'text-white/80' : 'text-[#0F172A]'}`}>No upcoming slots</h3>
                  <p className={`text-xs mt-2 font-bold opacity-30 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Explore arenas and book your favorite court today!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'past' && (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {allBookings.filter(b => b.status === 'Completed' && b.type !== 'Coaching').map((booking, index) => (
                  <BookingTimelineCard key={booking.id} booking={booking} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'coaching' && (
            <motion.div
              key="coaching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {allBookings.filter(b => b.type === 'Coaching').length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allBookings.filter(b => b.type === 'Coaching').map((booking, index) => (
                    <BookingTimelineCard key={booking.id} booking={booking} index={index} />
                  ))}
                </div>
              ) : (
                <div className="max-w-5xl mx-auto text-center py-24 px-10">
                  <div className={`w-24 h-24 mx-auto rounded-[40px] flex items-center justify-center mb-8 border-[3px] shadow-2xl relative ${isDark ? 'bg-white/5 border-white/5 shadow-black/40' : 'bg-white border-blue-100 shadow-blue-500/5'
                    }`}>
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <GraduationCap size={40} className={`opacity-20 ${isDark ? 'text-white' : 'text-blue-500'}`} />
                  </div>
                  <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>No Academy History</h3>
                  <p className={`text-xs mt-3 font-bold leading-relaxed opacity-30 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    You haven't enrolled in any coaching classes yet. Start your training today!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto text-center py-24 px-10"
            >
              <div className={`w-24 h-24 mx-auto rounded-[40px] flex items-center justify-center mb-8 border-[3px] shadow-2xl relative ${isDark ? 'bg-white/5 border-white/5 shadow-black/40' : 'bg-white border-blue-100 shadow-blue-500/5'
                }`}>
                {/* Glossy Reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <Receipt size={40} className={`opacity-20 ${isDark ? 'text-white' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>No receipts found</h3>
                <p className={`text-xs mt-3 font-bold leading-relaxed opacity-30 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  Your payment receipts will appear here once processed.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
