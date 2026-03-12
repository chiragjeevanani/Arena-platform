import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, CreditCard, Landmark, Banknote, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: Smartphone, color: 'text-[#22FF88]', bg: 'bg-[#22FF88]/10' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-[#1EE7FF]', bg: 'bg-[#1EE7FF]/10' },
    { id: 'netbanking', name: 'Net Banking', icon: Landmark, color: 'text-[#FFD600]', bg: 'bg-[#FFD600]/10' },
    { id: 'cash', name: 'Pay at Arena', icon: Banknote, color: 'text-white/50', bg: 'bg-white/5' },
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking-success', { state });
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl glass-light flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} className="text-white/60" />
        </button>
        <h1 className="text-lg font-bold text-white font-display">Payment</h1>
      </div>

      <div className="px-6 py-6 space-y-7">
        {/* Amount Display — Scoreboard style */}
        <div className="text-center glass-card py-10 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 court-lines opacity-10" />
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Payable Amount</p>
          <h2 className="text-4xl font-black text-white font-display relative z-10">₹{state?.amount?.toFixed(2)}</h2>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-[10px] font-bold text-white/30 mb-5 uppercase tracking-[0.2em]">Select Method</h3>
          <div className="space-y-3">
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedMethod === method.id
                      ? 'glass-neon border-[#22FF88]/30'
                      : 'glass-light border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                  />
                  <div className={`w-10 h-10 rounded-xl ${method.bg} flex items-center justify-center mr-4`}>
                    <Icon size={18} className={method.color} />
                  </div>
                  <span className={`text-sm font-bold flex-1 ${
                    selectedMethod === method.id ? 'text-white' : 'text-white/40'
                  }`}>
                    {method.name}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.id ? 'border-[#22FF88]' : 'border-white/15'
                  }`}>
                    {selectedMethod === method.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-[#22FF88]"
                      />
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Secure Transaction */}
        <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-wider">
          <ShieldCheck size={14} className="text-[#22FF88]/50" />
          <span>Secure & Encrypted Transaction</span>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-[60] md:max-w-[450px] md:mx-auto">
        <ShuttleButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={isProcessing}
          onClick={handlePay}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </ShuttleButton>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#08142B]/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <ShuttlecockIcon size={48} className="text-[#22FF88]" />
            </motion.div>
            <p className="mt-6 text-white font-bold tracking-tight font-display">Processing Payment...</p>
            <p className="text-white/30 text-sm mt-2">Please do not close the app</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
