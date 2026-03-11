import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Celebration, Share, Download, ReceiptLong } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="bg-[#03396C] min-h-screen flex flex-col pt-20">
      <div className="flex-1 px-6 space-y-12">
        <div className="text-center space-y-4">
           <motion.div 
             initial={{ scale: 0, rotate: -45 }}
             animate={{ scale: 1, rotate: 0 }}
             className="w-24 h-24 bg-white/20 backdrop-blur rounded-[40px] mx-auto flex items-center justify-center border-4 border-white/50"
           >
              <Check className="text-white" sx={{ fontSize: 60 }} />
           </motion.div>
           <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Booking Done!</h1>
              <p className="text-blue-100 text-lg mt-2 font-medium opacity-80">Your court is reserved</p>
           </div>
        </div>

        {/* Success Card */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Rings */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full" />
          <div className="absolute top-2 right-2 text-slate-100">
             <Celebration sx={{ fontSize: 100 }} />
          </div>

          <div className="space-y-8 relative">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                <span>Transaction Success</span>
                <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
             </div>

             <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Arena & Court</p>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {state?.arena?.name} <br />
                  <span className="text-[#03396C]"> {state?.court?.name}</span>
                </h3>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Date</p>
                   <p className="text-sm font-bold text-slate-900">{state?.date}</p>
                </div>
                <div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Time Slot</p>
                   <p className="text-sm font-bold text-slate-900">{state?.slot?.time}</p>
                </div>
             </div>

             <div className="pt-6 border-t-4 border-dashed border-slate-50 flex items-center justify-between">
                <div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Payment</p>
                   <p className="text-lg font-extrabold text-slate-900">₹{state?.amount?.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 text-[#03396C] p-3 rounded-2xl">
                   <ReceiptLong />
                </div>
             </div>
          </div>
        </motion.div>

        <div className="flex space-x-4">
           <button className="flex-1 bg-white/20 backdrop-blur-md text-white border border-white/20 py-4 rounded-3xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all">
              <Share sx={{ fontSize: 18 }} />
              <span>Share</span>
           </button>
           <button className="flex-1 bg-white/20 backdrop-blur-md text-white border border-white/20 py-4 rounded-3xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all">
              <Download sx={{ fontSize: 18 }} />
              <span>Ticket</span>
           </button>
        </div>
      </div>

      <div className="p-6 mt-12 mb-6">
         <button 
           onClick={() => navigate('/')}
           className="w-full bg-white text-slate-900 py-5 rounded-3xl font-extrabold shadow-2xl active:scale-95 transition-all text-base"
         >
           Go to Dashboard
         </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
