import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, CreditCard, Landmark, Banknote, ShieldCheck, ChevronRight, Lock } from 'lucide-react';
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
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: Smartphone, color: 'text-[#eb483f]', bg: 'bg-[#eb483f]/10', desc: 'Instant & Secure' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Full Security' },
    { id: 'netbanking', name: 'Net Banking', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'All Major Banks' },
    { id: 'cash', name: 'Pay at Arena', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'On-Site Payment' },
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking-success', { state });
    }, 2000);
  };

  return (
    <div className={`min-h-screen pb-40 relative overflow-hidden ${isDark ? 'bg-[#F3655D]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Compact Consistent Styling */}
      <div className={`px-6 pt-5 pb-3 sticky top-0 z-[60] backdrop-blur-2xl border-b transition-all duration-500 ${
        isDark ? 'bg-[#F3655D]/80 border-white/5' : 'bg-[#F3655D] border-blue-900/10 md:rounded-b-none rounded-b-[24px] shadow-[0_8px_25px_rgba(10,31,68,0.12)]'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white font-display tracking-tight">Confirm Payment</h1>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">Secure Checkout Process</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
             <ShieldCheck size={12} className="text-[#eb483f]" />
             <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">SSL Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left/Middle Column: Amount & Details */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-10 md:py-12 rounded-[36px] border relative overflow-hidden shadow-2xl transition-all ${
                isDark ? 'glass-card border-white/5 bg-white/5 shadow-black/40' : 'bg-white border-blue-50 shadow-[0_20px_60px_rgba(10,31,68,0.06)]'
              }`}
            >
              <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-10' : 'opacity-5'}`} />
              
              <div className="relative z-10">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-[#eb483f]/60' : 'text-blue-500'}`}>Total Payable</p>
                <h2 className={`text-4xl md:text-5xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>
                  â‚¹{state?.amount?.toFixed(2)}
                </h2>
                
                <div className="mt-6 flex items-center justify-center gap-5">
                   <div className="text-center">
                      <p className={`text-[7px] font-black uppercase text-slate-400 tracking-widest mb-0.5`}>Status</p>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase">Pending</span>
                   </div>
                   <div className="w-[1px] h-6 bg-slate-100 hidden md:block" />
                   <div className="text-center">
                      <p className={`text-[7px] font-black uppercase text-slate-400 tracking-widest mb-0.5`}>Order ID</p>
                      <span className={`text-[9px] font-black uppercase ${isDark ? 'text-white/40' : 'text-slate-600'}`}>#ARN-8829</span>
                   </div>
                </div>
              </div>
              
              <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-12 -mt-12 ${isDark ? 'bg-[#eb483f]/10' : 'bg-blue-100/50'}`} />
            </motion.div>

            {/* Security Badge Desktop Only */}
            <div className={`hidden lg:flex flex-col items-center justify-center gap-3 p-6 rounded-[32px] border border-dashed ${
              isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/50 border-slate-200'
            }`}>
               <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                  <Lock size={20} />
               </div>
               <div className="text-center">
                  <h4 className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>PCI-DSS Compliant</h4>
                  <p className={`text-[9px] font-bold mt-0.5 opacity-40 ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>Data encrypted with 256-bit SSL</p>
               </div>
            </div>
          </div>

          {/* Right Column: Payment Selection */}
          <div className="md:col-span-12 lg:col-span-7 space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-white/30' : 'text-[#F3655D]/40'}`}>Choose Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <motion.label
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={method.id}
                    className={`flex items-center p-5 rounded-[28px] border transition-all cursor-pointer relative group overflow-hidden ${
                      isSelected
                        ? `shadow-xl ${isDark ? 'bg-[#eb483f]/5 border-[#eb483f]/40' : 'bg-white border-blue-500 shadow-blue-500/10'}`
                        : `${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-slate-200'}`
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
                    <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center mr-5 transition-all duration-500 group-hover:scale-105`}>
                      <Icon size={24} className={method.color} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1">
                      <span className={`text-sm md:text-base font-black tracking-tight block transition-colors ${
                        isSelected ? (isDark ? 'text-white' : 'text-[#F3655D]') : (isDark ? 'text-white/40' : 'text-[#F3655D]/60')
                      }`}>
                        {method.name}
                      </span>
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] block mt-0.5 transition-colors ${
                        isSelected ? (isDark ? 'text-[#eb483f]' : 'text-blue-500') : (isDark ? 'text-white/20' : 'text-slate-400')
                      }`}>
                        {method.desc}
                      </span>
                    </div>

                    {/* Custom Radio Circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? (isDark ? 'border-[#eb483f] scale-110 shadow-[0_0_10px_rgba(235, 72, 63,0.5)]' : 'border-blue-500 scale-110') 
                        : (isDark ? 'border-white/10' : 'border-slate-200')
                    }`}>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#eb483f]' : 'bg-blue-500 shadow-lg shadow-blue-500/50'}`}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.label>
                );
              })}
            </div>
            
            <div className="hidden lg:block pt-4">
               <ShuttleButton
                variant="primary"
                size="md"
                fullWidth
                className="shadow-2xl shadow-[#eb483f]/20 !rounded-[20px] active:scale-95 transition-all disabled:opacity-50 py-4 text-sm"
                icon={!isProcessing && <ChevronRight size={22} />}
                disabled={isProcessing}
                onClick={handlePay}
              >
                {isProcessing ? 'Finalizing Secure Flow...' : `Complete Payment of â‚¹${state?.amount?.toFixed(2)}`}
              </ShuttleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Payment Action - Mobile & Medium Screens */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] lg:hidden border-t backdrop-blur-xl transition-colors duration-500 ${
        isDark ? 'bg-[#F3655D]/90 border-white/5' : 'bg-white/80 border-blue-50 shadow-[0_-20px_50px_rgba(10,31,68,0.1)]'
      }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-2xl shadow-[#eb483f]/20 !rounded-[20px] active:scale-95 transition-all disabled:opacity-50"
          icon={!isProcessing && <ChevronRight size={20} />}
          disabled={isProcessing}
          onClick={handlePay}
        >
          {isProcessing ? 'Verifying Transaction...' : `Pay â‚¹${state?.amount?.toFixed(2)}`}
        </ShuttleButton>
      </div>

      {/* Premium Full-screen Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#F3655D]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative z-10"
              >
                <ShuttlecockIcon size={80} className="text-[#eb483f] drop-shadow-[0_0_20px_rgba(235, 72, 63,0.5)]" />
              </motion.div>
              <div className="absolute inset-0 border-[4px] border-[#eb483f]/10 border-t-[#eb483f] rounded-full -m-4 animate-spin-slow"></div>
            </div>
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-2xl font-black text-white font-display tracking-tight"
            >
              Securing Your Transaction
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/40 text-[11px] mt-4 font-bold max-w-[240px] leading-relaxed"
            >
              Please wait while we communicate with your bank.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;

