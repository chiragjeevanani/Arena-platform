import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, CreditCard, Landmark, Banknote, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import { useTheme } from '../context/ThemeContext';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: Smartphone, color: 'text-[#22FF88]', bg: 'bg-[#22FF88]/10', desc: 'Instant Payment' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Secure Checkout' },
    { id: 'netbanking', name: 'Net Banking', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'All Indian Banks' },
    { id: 'cash', name: 'Pay at Arena', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Pay before you play' },
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking-success', { state });
    }, 2000);
  };

  return (
    <div className={`min-h-screen pb-40 relative overflow-hidden ${isDark ? 'bg-[#08142B]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Improved margin and dark background for high contrast */}
      <div className={`px-6 pt-6 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${
        isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-[#0A1F44] border-blue-900/10 rounded-b-[24px] shadow-[0_8px_25px_rgba(10,31,68,0.12)]'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/10 border-white/20 text-white shadow-sm'
            }`}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white font-display">Confirm Payment</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 relative z-10">
        {/* Amount Display — Premium Scoreboard style */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-7 rounded-[32px] border relative overflow-hidden shadow-2xl ${
            isDark ? 'glass-card border-white/5 bg-white/5' : 'bg-white border-blue-50 shadow-[0_15px_45px_rgba(10,31,68,0.06)]'
          }`}
        >
          {/* Subtle patterns */}
          <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-10' : 'opacity-5'}`} />
          
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 relative z-10 ${isDark ? 'text-[#22FF88]/50' : 'text-blue-500'}`}>Total Payable</p>
          <h2 className={`text-3xl font-black font-display relative z-10 tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            ₹{state?.amount?.toFixed(2)}
          </h2>
          
          {/* Decorative elements */}
          <div className={`absolute top-0 right-0 w-20 h-20 blur-3xl rounded-full -mr-10 -mt-10 ${isDark ? 'bg-[#22FF88]/10' : 'bg-blue-100/50'}`} />
        </motion.div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>Choose Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <motion.label
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={method.id}
                  className={`flex items-center p-4 rounded-[24px] border transition-all cursor-pointer relative group ${
                    isSelected
                      ? `shadow-xl ${isDark ? 'bg-[#22FF88]/5 border-[#22FF88]/40' : 'bg-white border-blue-500 shadow-blue-500/10'}`
                      : `${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setSelectedMethod(method.id)}
                  />
                  
                  {/* Icon with background */}
                  <div className={`w-10 h-10 rounded-xl ${method.bg} flex items-center justify-center mr-4 transition-transform group-hover:scale-110`}>
                    <Icon size={20} className={method.color} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1">
                    <span className={`text-sm font-black tracking-tight block ${
                      isSelected ? (isDark ? 'text-white' : 'text-[#0A1F44]') : (isDark ? 'text-white/40' : 'text-[#0A1F44]/60')
                    }`}>
                      {method.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
                      isSelected ? (isDark ? 'text-[#22FF88]' : 'text-blue-500') : (isDark ? 'text-white/20' : 'text-slate-400')
                    }`}>
                      {method.desc}
                    </span>
                  </div>

                  {/* Custom Radio Circle */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? (isDark ? 'border-[#22FF88] scale-110' : 'border-blue-500 scale-110') 
                      : (isDark ? 'border-white/10' : 'border-slate-200')
                  }`}>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#22FF88]' : 'bg-blue-500 shadow-lg shadow-blue-500/50'}`}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.label>
              );
            })}
          </div>
        </div>

        {/* Secure Transaction Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`flex items-center justify-center gap-3 p-4 rounded-[24px] border border-dashed ${
            isDark ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-100/50 border-slate-200 text-slate-400'
          }`}
        >
          <ShieldCheck size={16} className={isDark ? 'text-[#22FF88]/40' : 'text-blue-500/40'} />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure 256-bit SSL Transaction</span>
        </motion.div>
      </div>

      {/* Footer Payment Action */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] md:max-w-[450px] md:mx-auto border-t backdrop-blur-xl transition-colors duration-500 ${
        isDark ? 'bg-[#08142B]/90 border-white/5' : 'bg-white/80 border-blue-50 shadow-[0_-20px_50px_rgba(10,31,68,0.1)]'
      }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-2xl shadow-[#22FF88]/20 !rounded-[20px] active:scale-95 transition-all disabled:opacity-50"
          icon={!isProcessing && <ChevronRight size={20} />}
          disabled={isProcessing}
          onClick={handlePay}
        >
          {isProcessing ? 'Verifying Transaction...' : `Pay ₹${state?.amount?.toFixed(2)}`}
        </ShuttleButton>
      </div>

      {/* Premium Full-screen Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#08142B]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative z-10"
              >
                <ShuttlecockIcon size={80} className="text-[#22FF88] drop-shadow-[0_0_20px_rgba(34,255,136,0.5)]" />
              </motion.div>
              {/* Spinner animation */}
              <div className="absolute inset-0 border-4 border-[#22FF88]/10 border-t-[#22FF88] rounded-full -m-4"></div>
            </div>
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-2xl font-black text-white font-display tracking-tight"
            >
              Securing Your Booking
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/40 text-sm mt-4 font-bold max-w-[200px]"
            >
              Please wait while we process your request with the bank.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
