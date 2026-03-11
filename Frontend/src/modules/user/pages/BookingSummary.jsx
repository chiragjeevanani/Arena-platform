import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBack, ArrowForward, CheckCircle, LocationOn, CalendarToday, AccessTime, ConfirmationNumber } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BookingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { arena, court, date, slot } = state || {};

  if (!arena) return <div className="p-10 text-center">No booking details found</div>;

  const total = slot?.price || 0;
  const tax = total * 0.18; // 18% GST

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-50 shadow-sm border-b border-slate-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <ArrowBack className="text-slate-900" sx={{ fontSize: 20 }} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 text-center flex-1 pr-10">Review Booking</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Arena Summary Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 border border-slate-100"
        >
          <div className="flex space-x-4">
             <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-sm">
                <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 space-y-1">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{arena.name}</h3>
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  <LocationOn sx={{ fontSize: 14, mr: 0.5 }} className="text-[#03396C]" />
                  {arena.location}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{arena.description}</p>
             </div>
          </div>
        </motion.div>

        {/* Booking Details List */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 border border-slate-100 divide-y divide-slate-50">
           <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                   <CalendarToday sx={{ fontSize: 20 }} />
                 </div>
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Date</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{date}</span>
           </div>
           <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                   <AccessTime sx={{ fontSize: 20 }} />
                 </div>
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Slot</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{slot?.time}</span>
           </div>
           <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <CheckCircle sx={{ fontSize: 20 }} />
                 </div>
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Court</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{court?.name} ({court?.type})</span>
           </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Payment Info</h4>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                 <span>Subtotal</span>
                 <span className="font-bold text-slate-900">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                 <span>GST (18%)</span>
                 <span className="font-bold text-slate-900">₹{tax.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-xl font-extrabold text-slate-900 mb-2">Total Amount</span>
                 <span className="text-2xl font-extrabold text-[#03396C]">₹{(total + tax).toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 z-[60]">
         <button 
           onClick={() => navigate('/payment', { state: { amount: total + tax, arena, court, date, slot } })}
           className="w-full bg-slate-900 text-white py-5 rounded-3xl font-extrabold shadow-2xl shadow-slate-400 active:scale-[0.98] transition-all text-base flex items-center justify-center space-x-3"
         >
           <span>Confirm Booking</span>
           <ArrowForward sx={{ fontSize: 20 }} />
         </button>
      </div>
    </div>
  );
};

export default BookingSummary;
