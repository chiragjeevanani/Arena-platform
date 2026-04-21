import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Smartphone, CreditCard, Landmark, Banknote, ShieldCheck, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import { useTheme } from '../context/ThemeContext';
import { isApiConfigured, getMockPaymentWebhookSecret } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { completeWalletTopUpViaMockPayment } from '../../../services/mockTopUpFlow';
import { registerForEvent } from '../../../services/eventsApi';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState('');

  // Fallback amount in case navigated without state
  const amount = state?.amount || 0;

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: Smartphone, color: 'text-[#CE2029]', bg: 'bg-[#CE2029]/10', desc: 'Instant & Secure' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Full Security' },
    { id: 'netbanking', name: 'Net Banking', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'All Major Banks' },
    { id: 'cash', name: 'Pay at Arena', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'On-Site Payment' },
  ];

  const handlePay = async () => {
    setPayError('');
    const amountNum = Number(amount) || 0;
    const mockSecret = getMockPaymentWebhookSecret();
    const useMockTopUp =
      state?.paymentPurpose === 'top_up' &&
      isApiConfigured() &&
      getAuthToken() &&
      Boolean(mockSecret) &&
      amountNum > 0;

    if (useMockTopUp) {
      setIsProcessing(true);
      try {
        await completeWalletTopUpViaMockPayment(amountNum, mockSecret);
        setIsProcessing(false);
        navigate('/booking-success', {
          state: { ...state, type: 'wallet_top_up', amount: amountNum },
        });
      } catch (e) {
        setPayError(e.message || 'Payment failed');
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      if (state?.type === 'event' && state?.registrationInfo) {
        await registerForEvent(state.registrationInfo);
      }
      
      // Artificial delay for premium experience
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsProcessing(false);
      navigate('/booking-success', { state });
    } catch (err) {
      console.error('Payment/Registration Error:', err);
      setPayError(err.message || 'Processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen pb-40 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      {/* Premium Desktop Decorations */}
      <div className="hidden lg:block absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#CE2029]/5 to-transparent pointer-events-none" />
      <div className="hidden lg:block absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-50/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Header - Brand Consistent */}
      <div className={`px-6 pt-3 md:pt-4 pb-3 md:pb-4 sticky top-0 z-[60] backdrop-blur-2xl border-b transition-all duration-500 ${isDark ? 'bg-[#0f1115]/80 border-white/10' : 'bg-[#CE2029] border-white/10 shadow-lg'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'border-white/20 bg-white/10 text-white hover:bg-white/20'}`}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-sm md:text-base font-black text-white uppercase tracking-[0.2em] font-display">Secure Payment</h1>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
             <Lock size={14} className="text-white" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">SSL Encrypted</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
          
          {/* LEFT: Billing Sidebar (Billboard) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'} border lg:rounded-none rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]`}
            >
              <div className="bg-slate-900 p-6 md:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE2029]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029] mb-1">Total Amount Due</p>
                <h2 className="text-3xl md:text-5xl font-black font-display tracking-tighter text-white">OMR {amount.toFixed(3)}</h2>
              </div>

              <div className="p-6 md:p-10 space-y-4">
                 <div className={`flex justify-between items-center py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Order ID</span>
                    <span className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>#PAY-{Math.floor(Math.random()*90000) + 10000}</span>
                 </div>
                 <div className={`flex justify-between items-center py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest border border-amber-100 italic">Awaiting Payment</span>
                 </div>

                 {/* Desktop Only Secure Badges */}
                 <div className="hidden lg:grid grid-cols-2 gap-4 pt-4">
                    <div className={`p-4 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} lg:rounded-none flex flex-col items-center text-center gap-2`}>
                       <ShieldCheck size={20} className="text-emerald-500" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">PCI Compliant</span>
                    </div>
                    <div className={`p-4 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} lg:rounded-none flex flex-col items-center text-center gap-2`}>
                       <Banknote size={20} className="text-[#CE2029]" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Safe Checkout</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            {payError ? (
              <p className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {payError}
              </p>
            ) : null}
            <div className="px-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029] mb-0.5">Payment Method</h3>
              <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Select to proceed</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <motion.label
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={method.id}
                    className={`flex items-center p-3.5 lg:p-6 lg:rounded-none rounded-xl border cursor-pointer relative group transition-all duration-300 ${isSelected
                        ? `border-[#CE2029] shadow-[0_10px_20px_rgba(206, 32, 41,0.08)] ring-1 ring-[#CE2029] ${isDark ? 'bg-[#1a1d24]' : 'bg-white'}`
                        : `${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`
                      }`}
                  >
                    <input type="radio" name="payment" className="hidden" checked={isSelected} onChange={() => setSelectedMethod(method.id)} />
                    
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 lg:rounded-none rounded-lg ${method.bg} flex items-center justify-center mr-4 lg:mr-6 transition-transform group-hover:scale-110`}>
                      <Icon size={20} className={method.color} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1">
                      <span className={`text-xs lg:text-[13px] font-black uppercase tracking-widest block ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-white/60' : 'text-slate-500')}`}>
                        {method.name}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                        {method.desc}
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#CE2029] bg-[#CE2029]/5' : (isDark ? 'border-white/20' : 'border-slate-200')}`}>
                      {isSelected && <div className="w-2 rounded-full bg-[#CE2029] aspect-square shadow-sm" />}
                    </div>
                  </motion.label>
                );
              })}
            </div>

            {/* Desktop Pay Button */}
            <div className="hidden lg:block pt-4">
               <button 
                  disabled={isProcessing}
                  onClick={handlePay}
                  className={`group relative w-full h-16 lg:rounded-none overflow-hidden transition-all duration-500 ${isProcessing ? 'bg-slate-100' : 'bg-[#CE2029] shadow-[0_20px_40px_rgba(206, 32, 41,0.2)] hover:shadow-[0_25px_50px_rgba(206, 32, 41,0.3)] hover:-translate-y-1 active:translate-y-0'}`}
               >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[45deg]" />
                  <div className="relative z-10 flex items-center justify-center gap-3">
                     <span className={`text-xs font-black uppercase tracking-[0.3em] ${isProcessing ? 'text-slate-400' : 'text-white'}`}>
                        {isProcessing ? 'Processing Transaction...' : 'Authorize Payment Now'}
                     </span>
                     {!isProcessing && <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />}
                  </div>
                  {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-[#CE2029] animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }} />}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] lg:hidden backdrop-blur-xl border-t border-[#CE2029]/10 shadow-[0_-10px_30px_rgba(206, 32, 41,0.05)] rounded-t-[32px] ${isDark ? 'bg-[#0f1115]/90' : 'bg-white/90'}`}>
        <button
          disabled={isProcessing}
          onClick={handlePay}
          className="w-full py-4 bg-[#CE2029] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? 'Verifying...' : `Pay OMR ${amount.toFixed(3)}`}
          {!isProcessing && <ChevronRight size={18} />}
        </button>
      </div>

      {/* Premium Full-screen Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] ${isDark ? 'bg-[#0f1115]/90' : 'bg-[#1e2025]/95'} backdrop-blur-md flex flex-col items-center justify-center p-10 text-center`}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative z-10"
              >
                <ShuttlecockIcon size={80} className="text-[#CE2029] drop-shadow-[0_0_30px_rgba(206, 32, 41,0.6)]" />
              </motion.div>
              <div className="absolute inset-0 border-[4px] border-white/5 border-t-[#CE2029] rounded-full -m-6 animate-spin-slow"></div>
              <div className="absolute inset-0 border-[2px] border-white/5 border-b-[#CE2029] rounded-full -m-10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
            </div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <h3 className="text-xl font-bold text-white tracking-tight">
                Securing Transaction
              </h3>
              <div className="flex justify-center gap-1 mt-3">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#CE2029]"
                  />
                ))}
              </div>
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 text-xs mt-4 font-medium max-w-[240px] leading-relaxed tracking-wide"
            >
              Bank connection established<br/>Processing via secure 256-bit SSL
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
