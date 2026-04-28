import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Receipt, User, Clock, MapPin, 
  CheckCircle2, Printer, Download, Share2,
  Package, CreditCard, Banknote, RefreshCw,
  MoreVertical, ShieldCheck, Mail, Phone
} from 'lucide-react';
import { getAdminPosSaleById } from '../../../services/adminOpsApi';
import { getArenaAdminPosSaleById } from '../../../services/arenaAdminApi';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';

const TransactionDetails = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (!saleId || !isApiConfigured() || !getAuthToken()) return;
    (async () => {
      setIsLoading(true);
      try {
        const isArenaScope = location.pathname.startsWith('/arena');
        const fetchFn = isArenaScope ? getArenaAdminPosSaleById : getAdminPosSaleById;
        const data = await fetchFn(saleId);
        setSale(data.sale);
      } catch (e) {
        setError(e.message || 'Failed to load transaction details');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [saleId, location.pathname]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
           <RefreshCw className="animate-spin text-[#CE2029] mx-auto" size={40} />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verifying Ledger Entry...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <ShieldCheck size={48} className="text-red-300 mb-4" />
        <h2 className="text-xl font-black text-[#36454F] uppercase italic tracking-tight mb-2">Access Denied / Not Found</h2>
        <p className="text-xs font-bold text-slate-400 max-w-md mb-8">{error || 'This transaction could not be located in your arena scope.'}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-[#36454F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
           <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-400 hover:text-[#36454F] transition-all"
           >
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                <ArrowLeft size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Ledger</span>
           </button>

           <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="px-6 py-3 bg-white border border-slate-200 text-[#36454F] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-[#CE2029]/30 hover:bg-slate-50 transition-all shadow-sm"
              >
                 <Printer size={16} /> Print Receipt
              </button>
              <button className="px-6 py-3 bg-[#36454F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10">
                 <Download size={16} /> Download PDF
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: Summary & Items */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Main Receipt Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
              >
                 <div className="p-8 border-b border-slate-50 flex items-start justify-between">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <div className="px-3 py-1 bg-[#CE2029]/10 text-[#CE2029] rounded-full text-[9px] font-black uppercase tracking-widest">
                             Settled
                          </div>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Transaction Verified</p>
                       </div>
                       <h1 className="text-3xl font-oswald font-black text-[#36454F] uppercase">Invoice #{sale.id.slice(-8)}</h1>
                       <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                             <Clock size={12} />
                             {new Date(sale.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                             <Package size={12} />
                             Retail POS Terminal
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <Receipt size={40} className="text-[#CE2029] opacity-20 ml-auto" />
                    </div>
                 </div>

                 <div className="p-8 space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-4">Line Items Breakdown</h3>
                    
                    <div className="space-y-4">
                       {sale.lines.map((line, idx) => (
                         <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#36454F] font-black text-xs group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029] transition-colors">
                                  {line.qty}x
                               </div>
                               <div>
                                  <p className="text-sm font-black text-[#36454F] uppercase tracking-tight">{line.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Unit: OMR {line.unitPrice.toFixed(3)}</p>
                               </div>
                            </div>
                            <p className="text-base font-oswald font-black text-[#36454F]">OMR {line.lineTotal.toFixed(3)}</p>
                         </div>
                       ))}
                    </div>

                    <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-100 space-y-3">
                       <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>Subtotal</span>
                          <span className="text-[#36454F]">OMR {sale.totalAmount.toFixed(3)}</span>
                       </div>
                       <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>Service Charge & Tax (18%)</span>
                          <span className="text-[#36454F]">Inclusive</span>
                       </div>
                       <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] mb-1">Total Amount Paid</p>
                             <p className="text-[8px] font-bold text-slate-300 italic">This is a system generated tax invoice</p>
                          </div>
                          <p className="text-4xl font-oswald font-black text-[#36454F]">
                             <span className="text-xs mr-2 opacity-30">OMR</span>
                             {sale.totalAmount.toFixed(3)}
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>

              {/* Security Badge */}
              <div className="flex items-center gap-4 p-6 bg-green-50 rounded-2xl border border-green-100">
                 <ShieldCheck className="text-green-600" size={24} />
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Payment Secured by ArenaVault</p>
                    <p className="text-[9px] font-bold text-green-600/70 mt-0.5">Transaction Hash: {sale.id.toUpperCase()}-S-2025</p>
                 </div>
              </div>

           </div>

           {/* Right Column: Customer & Payment Method */}
           <div className="space-y-6">
              
              {/* Customer Details */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/40"
              >
                 <div className="flex items-center gap-3 mb-6">
                    <User className="text-[#CE2029]" size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#36454F]">Customer Profile</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[#36454F]">
                          <User size={28} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-[#36454F] uppercase">{sale.customer?.name || 'Walk-in Customer'}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">{sale.customer?.id || 'GUEST-01'}</p>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#CE2029] transition-colors">
                             <Phone size={14} />
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Phone Number</p>
                             <p className="text-xs font-bold text-[#36454F]">{sale.customer?.phone || 'Not Provided'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#CE2029] transition-colors">
                             <Mail size={14} />
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Email Address</p>
                             <p className="text-xs font-bold text-[#36454F]">{sale.customer?.email || 'N/A'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#36454F] rounded-3xl p-8 text-white shadow-xl shadow-black/10"
              >
                 <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="text-[#CE2029]" size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest opacity-60">Payment Method</h3>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          {sale.paymentMethod === 'CASH' ? <Banknote size={24} /> : <CreditCard size={24} />}
                       </div>
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight">{sale.paymentMethod || 'Settled POS'}</p>
                          <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Transaction Success</p>
                       </div>
                    </div>
                    <CheckCircle2 size={24} className="text-green-400" />
                 </div>
              </motion.div>

           </div>

        </div>

      </div>

      {/* Print Specific Layout */}
      <div className="hidden print:block font-mono text-[12px] p-8 max-w-[400px] mx-auto border border-dashed border-slate-300">
         <div className="text-center mb-8 border-b-2 border-slate-200 pb-4">
            <h2 className="text-xl font-bold uppercase mb-1">ARENA CRM</h2>
            <p className="text-[10px]">INVOICE #{sale.id.toUpperCase()}</p>
            <p className="text-[10px] mt-2">{new Date(sale.createdAt).toLocaleString()}</p>
         </div>

         <div className="space-y-2 mb-6">
            <div className="flex justify-between font-bold border-b border-slate-100 pb-1 uppercase text-[10px]">
               <span>Item</span>
               <span>Price</span>
            </div>
            {sale.lines.map((line, idx) => (
              <div key={idx} className="flex justify-between">
                 <span>{line.qty}x {line.name}</span>
                 <span>{line.lineTotal.toFixed(3)}</span>
              </div>
            ))}
         </div>

         <div className="border-t-2 border-slate-200 pt-4 space-y-1">
            <div className="flex justify-between">
               <span>Subtotal</span>
               <span>{sale.totalAmount.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
               <span>Tax (18%)</span>
               <span>Inclusive</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2">
               <span>TOTAL PAID</span>
               <span>OMR {sale.totalAmount.toFixed(3)}</span>
            </div>
         </div>

         <div className="mt-8 pt-4 border-t border-slate-100 text-[10px]">
            <p className="font-bold mb-1 uppercase">Customer Details</p>
            <p>{sale.customer?.name || 'Walk-in'}</p>
            <p>{sale.customer?.phone || 'N/A'}</p>
         </div>

         <div className="mt-12 text-center text-[10px] italic">
            <p>Thank you for choosing Arena</p>
            <p>Visit again soon!</p>
         </div>
      </div>

    </div>
  );
};

export default TransactionDetails;
