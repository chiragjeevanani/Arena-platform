import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, GraduationCap } from 'lucide-react';
import { USER_BOOKINGS } from '../../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import BookingTimelineCard from '../components/BookingTimeline';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toggleTheme } = useTheme();
  const isDark = false;
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
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Premium Dark Style */}
      {/* Header - Desktop Hidden Logo/Nav Row */}
      <div className="md:hidden">
        <div className={`px-4 pt-4 pb-4 bg-[#eb483f] rounded-b-3xl shadow-[0_10px_30px_rgba(235,72,63,0.15)] border-b border-white/10`}>
          <div className="max-w-5xl mx-auto flex justify-between items-center mb-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg font-bold font-display text-white tracking-tight">My Bookings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row - Visible on both but styled for desktop consistency */}
      <div className="px-6 py-4 md:pt-6 md:pb-2 z-[50] transition-all">
        <div className={`max-w-md mx-auto flex gap-1.5 p-1.5 rounded-[22px] backdrop-blur-md relative overflow-hidden border transition-all ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-blue-100 shadow-sm'
        }`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-1 rounded-[16px] text-[9px] font-black uppercase tracking-wider transition-all duration-500 relative z-10 ${activeTab === tab.id
                  ? 'bg-gradient-to-br from-[#eb483f] to-[#eb483f] text-white shadow-[0_5px_15px_rgba(235, 72, 63, 0.3)]'
                  : 'text-[#eb483f]/40 hover:text-[#eb483f]/70 hover:bg-slate-50'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 md:pt-2 md:pb-8 space-y-6 relative z-10">
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
                    <Receipt size={32} className="text-[#eb483f]/20" />
                  </div>
                  <h3 className={`text-lg font-black font-display ${'text-[#0F172A]'}`}>No upcoming slots</h3>
                  <p className={`text-xs mt-2 font-bold opacity-30 ${'text-[#0F172A]'}`}>Explore arenas and book your favorite court today!</p>
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
                  <div className={`w-24 h-24 mx-auto rounded-[40px] flex items-center justify-center mb-8 border-[3px] shadow-2xl relative ${'bg-white border-blue-100 shadow-blue-500/5'
                    }`}>
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <GraduationCap size={40} className={`opacity-20 ${'text-blue-500'}`} />
                  </div>
                  <h3 className={`text-xl font-black font-display tracking-tight ${'text-[#0F172A]'}`}>No Academy History</h3>
                  <p className={`text-xs mt-3 font-bold leading-relaxed opacity-30 ${'text-[#0F172A]'}`}>
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
              <div className={`w-24 h-24 mx-auto rounded-[40px] flex items-center justify-center mb-8 border-[3px] shadow-2xl relative bg-white border-blue-100 shadow-[0_10px_30px_rgba(235, 72, 63, 0.05)]`}>
                {/* Glossy Reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <Receipt size={40} className={`opacity-20 text-[#eb483f]`} />
              </div>
              <div>
                <h3 className={`text-xl font-black font-display tracking-tight ${'text-[#0F172A]'}`}>No receipts found</h3>
                <p className={`text-xs mt-3 font-bold leading-relaxed opacity-30 ${'text-[#0F172A]'}`}>
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



