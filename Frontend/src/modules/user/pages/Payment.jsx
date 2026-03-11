import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBack, CreditCard, AccountBalance, Smartphone, Payments, CheckCircle, VerifiedUser } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: <Smartphone />, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard />, color: 'bg-blue-50 text-blue-600' },
    { id: 'netbanking', name: 'Net Banking', icon: <AccountBalance />, color: 'bg-amber-50 text-amber-600' },
    { id: 'cash', name: 'Pay at Arena', icon: <Payments />, color: 'bg-indigo-50 text-indigo-600' }
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking-success', { state });
    }, 2000);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 pt-12 pb-6 flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
          <ArrowBack className="text-slate-900" sx={{ fontSize: 20 }} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Payment</h1>
      </div>

      <div className="px-6 py-8 space-y-8">
        <div className="text-center bg-slate-50 py-10 rounded-[40px] border border-slate-100">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Payable Amount</p>
           <h2 className="text-4xl font-extrabold text-slate-900">₹{state?.amount?.toFixed(2)}</h2>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest">Select Method</h3>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <label 
                key={method.id} 
                className={`flex items-center p-5 rounded-[28px] border-2 transition-all cursor-pointer ${
                  selectedMethod === method.id ? 'border-[#03396C] bg-blue-50/20' : 'border-slate-50 bg-white shadow-sm'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  className="hidden" 
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${method.color}`}>
                  {method.icon}
                </div>
                <span className={`text-sm font-bold flex-1 ${selectedMethod === method.id ? 'text-slate-900' : 'text-slate-500'}`}>
                   {method.name}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-[#03396C]' : 'border-slate-200'}`}>
                  {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-[#03396C]" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-4">
           <VerifiedUser sx={{ fontSize: 16 }} className="text-[#03396C]" />
           <span>Secure & Encrypted Transaction</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6">
         <button 
           onClick={handlePay}
           disabled={isProcessing}
           className="w-full bg-slate-900 text-white py-5 rounded-3xl font-extrabold shadow-2xl shadow-slate-400 active:scale-[0.98] transition-all text-base flex items-center justify-center space-x-3"
         >
           {isProcessing ? 'Processing...' : 'Pay Now'}
         </button>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
             <div className="w-16 h-16 border-4 border-blue-100 border-t-[#03396C] rounded-full animate-spin" />
             <p className="mt-6 text-slate-900 font-bold tracking-tight">Processing Payment...</p>
             <p className="text-slate-400 text-sm mt-2">Please do not close the app</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
