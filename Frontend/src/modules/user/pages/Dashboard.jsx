import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import { USER_BOOKINGS } from '../../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import BookingTimelineCard from '../components/BookingTimeline';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { isDark } = useTheme();

  const tabs = [
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'past', name: 'Past' },
    { id: 'coaching', name: 'Coaching' },
    { id: 'payments', name: 'Payments' },
  ];

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className={`px-6 pt-14 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-[#F0F4F8]/80 border-[#0A1F44]/5'}`}>
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl glass-light flex items-center justify-center border active:scale-90 transition-transform ${isDark ? 'border-white/10' : 'border-[#0A1F44]/10'}`}
          >
            <ArrowLeft size={18} className={isDark ? 'text-white/60' : 'text-[#0A1F44]/60'} />
          </button>
          <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>My Bookings</h1>
        </div>

        {/* Tab Switcher — Scoreboard style */}
        <div className="flex gap-1 glass-light p-1 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#22FF88]/10 text-[#22FF88] border border-[#22FF88]/20'
                  : 'text-white/25 hover:text-white/40 border border-transparent'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {USER_BOOKINGS.filter(b => b.status === 'Upcoming').map((booking, index) => (
                <BookingTimelineCard key={booking.id} booking={booking} index={index} />
              ))}
            </motion.div>
          )}

          {activeTab === 'past' && (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {USER_BOOKINGS.filter(b => b.status === 'Completed').map((booking, index) => (
                <BookingTimelineCard key={booking.id} booking={booking} index={index} />
              ))}
            </motion.div>
          )}

          {(activeTab === 'coaching' || activeTab === 'payments') && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-6 space-y-4"
            >
              <div className="w-16 h-16 glass-light rounded-3xl mx-auto flex items-center justify-center">
                <Receipt size={28} className="text-white/15" />
              </div>
              <div>
                <h3 className={`text-base font-bold font-display ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>No data found</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>You haven't made any transactions in this category yet.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
