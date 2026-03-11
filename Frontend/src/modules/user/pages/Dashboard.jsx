import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, CalendarToday, AccessTime, ReceiptLong, MoreVert, ConfirmationNumber } from '@mui/icons-material';
import { USER_BOOKINGS } from '../../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'past', name: 'Past' },
    { id: 'coaching', name: 'Coaching' },
    { id: 'payments', name: 'Payments' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-50 shadow-sm border-b border-slate-50">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <ArrowBack className="text-slate-900" sx={{ fontSize: 20 }} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">My Bookings</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-100 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-[#03396C] shadow-sm' 
                : 'text-slate-400'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' && (
            <motion.div 
              key="upcoming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {USER_BOOKINGS.filter(b => b.status === 'Upcoming').map(booking => (
                <div key={booking.id} className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm text-[#03396C] font-bold">
                            🏸
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-900">{booking.arenaName}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{booking.courtName}</p>
                         </div>
                      </div>
                      <div className="bg-blue-50 text-[#03396C] px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100 shadow-sm">
                         Confirmed
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-slate-100">
                      <div className="flex items-center space-x-2">
                         <CalendarToday className="text-slate-200" sx={{ fontSize: 16 }} />
                         <span className="text-xs font-bold text-slate-600 tracking-tight">{booking.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                         <AccessTime className="text-slate-200" sx={{ fontSize: 16 }} />
                         <span className="text-xs font-bold text-slate-600 tracking-tight">{booking.slot}</span>
                      </div>
                   </div>

                   <div className="flex justify-between items-center">
                      <div className="flex items-center -space-x-2">
                         {[1,2].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                         ))}
                         <span className="text-[10px] text-slate-400 font-bold ml-4 uppercase tracking-widest">Player List</span>
                      </div>
                      <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all">
                        View Ticket
                      </button>
                   </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab !== 'upcoming' && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-6 space-y-4"
            >
               <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200 shadow-inner">
                  <ReceiptLong sx={{ fontSize: 40 }} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">No data found</h3>
                  <p className="text-slate-400 text-sm mt-1">You haven't made any transactions in this category yet.</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
