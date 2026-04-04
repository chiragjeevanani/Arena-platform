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

  // Fallback amount in case navigated without state
  const amount = state?.amount || 0;

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
    <div className={`min-h-screen pb-40 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Compact Consistent Styling */}
      <div className={`px-4 pt-4 pb-3 sticky top-0 z-[60] backdrop-blur-2xl border-b transition-all duration-500 ${isDark ? 'bg-[#0f1115]/80 border-white/5' : 'bg-white/80 border-[#eb483f]/10 md:rounded-b-none rounded-b-[20px] shadow-[0_4px_15px_rgba(235,72,63,0.05)]'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-[#eb483f]/30'}`}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Confirm Payment</h1>
              <p className={`text-[10px] font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Secure Checkout</p>
            </div>
          </div>

          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#eb483f]/5 border-[#eb483f]/10'}`}>
            <ShieldCheck size={14} className="text-[#eb483f]" />
            <span className={`text-[10px] font-semibold ${isDark ? 'text-white/80' : 'text-[#eb483f]'}`}>SSL Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Left/Middle Column: Amount & Details */}
          <div className="md:col-span-12 lg:col-span-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-5 md:py-6 rounded-[24px] border relative overflow-hidden shadow-xl transition-all ${isDark ? 'bg-[#1a1d24] border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-gradient-to-br from-[#eb483f] to-[#d43b33] border-[#eb483f]/20 shadow-[0_10px_30px_rgba(235,72,63,0.2)]'}`}
            >
              <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-5' : 'opacity-[0.05]'}`} />

              <div className="relative z-10">
                <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white/40' : 'text-white/80'}`}>Total Payable</p>
                <h2 className={`text-3xl md:text-4xl font-bold tracking-tight text-white`}>
                  OMR {amount.toFixed(3)}
                </h2>

                <div className="mt-3 flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className={`text-[10px] uppercase font-medium tracking-wide mb-0.5 ${isDark ? 'text-white/40' : 'text-white/60'}`}>{state?.type === 'membership' ? 'Plan' : 'Status'}</p>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-white/20 text-white'}`}>
                      {state?.type === 'membership' ? state.plan?.name : 'Pending'}
                    </span>
                  </div>
                  <div className={`w-[1px] h-6 hidden md:block ${isDark ? 'bg-white/10' : 'bg-white/20'}`} />
                  <div className="text-center">
                    <p className={`text-[10px] uppercase font-medium tracking-wide mb-0.5 ${isDark ? 'text-white/40' : 'text-white/60'}`}>{state?.type === 'membership' ? 'Duration' : 'Order ID'}</p>
                    <span className={`text-[10px] font-semibold ${isDark ? 'text-white/70' : 'text-white'}`}>
                      {state?.type === 'membership' ? state.plan?.duration : '#ARN-8829'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-12 -mt-12 ${isDark ? 'bg-[#eb483f]/10' : 'bg-white/20'}`} />
            </motion.div>

            {/* Security Badge Desktop Only */}
            <div className={`hidden lg:flex items-center gap-3 p-4 rounded-2xl border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#eb483f]/5 border-[#eb483f]/20'}`}>
              <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#eb483f]/20 text-[#eb483f]' : 'bg-[#eb483f]/10 text-[#eb483f]'}`}>
                <Lock size={16} />
              </div>
              <div>
                <h4 className={`text-[11px] font-semibold tracking-tight ${isDark ? 'text-white/90' : 'text-[#eb483f]'}`}>PCI-DSS Compliant</h4>
                <p className={`text-[9px] font-medium mt-0.5 opacity-70 ${isDark ? 'text-white/50' : 'text-[#eb483f]'}`}>Data encrypted with 256-bit SSL</p>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Selection */}
          <div className="md:col-span-12 lg:col-span-7 space-y-4">
            <h3 className={`text-xs font-semibold ml-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Choose Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <motion.label
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={method.id}
                    className={`flex items-center p-3 rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${isSelected
                        ? `shadow-md ${isDark ? 'bg-[#1a1d24] border-[#eb483f] shadow-[#eb483f]/10' : 'bg-white border-[#eb483f] shadow-[#eb483f]/10'}`
                        : `${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-[#eb483f]/30 hover:shadow-sm'}`
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
                    <div className={`w-10 h-10 rounded-lg ${method.bg} flex items-center justify-center mr-4 transition-all duration-500`}>
                      <Icon size={20} className={method.color} strokeWidth={2} />
                    </div>

                    <div className="flex-1">
                      <span className={`text-sm md:text-sm font-semibold block transition-colors ${isSelected 
                          ? (isDark ? 'text-white' : 'text-slate-900') 
                          : (isDark ? 'text-white/70' : 'text-slate-700')
                        }`}>
                        {method.name}
                      </span>
                      <span className={`text-[10px] font-medium block transition-colors ${isSelected 
                          ? 'text-[#eb483f]' 
                          : (isDark ? 'text-white/40' : 'text-slate-500')
                        }`}>
                        {method.desc}
                      </span>
                    </div>

                    {/* Custom Radio Circle */}
                    <div className={`w-4 h-4 rounded-full border border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                        ? 'border-[#eb483f]'
                        : (isDark ? 'border-white/20' : 'border-slate-300')
                      }`}>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-2 h-2 rounded-full bg-[#eb483f]"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.label>
                );
              })}
            </div>

            <div className="hidden lg:block pt-2">
              <ShuttleButton
                variant="primary"
                size="md"
                fullWidth
                className="shadow-lg shadow-[#eb483f]/20 !rounded-xl active:scale-95 transition-all disabled:opacity-50 py-3 text-xs"
                icon={!isProcessing && <ChevronRight size={18} />}
                disabled={isProcessing}
                onClick={handlePay}
              >
                {isProcessing ? 'Finalizing Secure Flow...' : `Complete Payment of OMR ${amount.toFixed(3)}`}
              </ShuttleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Payment Action - Mobile & Medium Screens */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 z-[100] lg:hidden border-t backdrop-blur-xl transition-colors duration-500 rounded-t-[24px] ${isDark ? 'bg-[#0f1115]/90 border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'bg-white/90 border-[#eb483f]/10 shadow-[0_-10px_30px_rgba(235,72,63,0.05)]'}`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-md shadow-[#eb483f]/20 !rounded-[16px] active:scale-95 transition-all disabled:opacity-50 py-3.5"
          icon={!isProcessing && <ChevronRight size={18} />}
          disabled={isProcessing}
          onClick={handlePay}
        >
          {isProcessing ? 'Verifying Transaction...' : `Pay OMR ${amount.toFixed(3)}`}
        </ShuttleButton>
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
                <ShuttlecockIcon size={80} className="text-[#eb483f] drop-shadow-[0_0_30px_rgba(235,72,63,0.6)]" />
              </motion.div>
              <div className="absolute inset-0 border-[4px] border-white/5 border-t-[#eb483f] rounded-full -m-6 animate-spin-slow"></div>
              <div className="absolute inset-0 border-[2px] border-white/5 border-b-[#eb483f] rounded-full -m-10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
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
                    className="w-1.5 h-1.5 rounded-full bg-[#eb483f]"
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
