import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Send, Users, Calendar, Clock, CheckCircle2, AlertCircle, Info, Bookmark } from 'lucide-react';

const Broadcaster = () => {
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('All Players');
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
    setMessage('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* 1. Compose Notice */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#1a2b3c] flex items-center gap-2">
            <Megaphone size={22} className="text-[#eb483f]" /> Arena Broadcaster
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Send arena-wide alerts & updates</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Notice Category</label>
             <div className="grid grid-cols-3 gap-2">
               {['Maintenance', 'Events', 'Offers'].map(cat => (
                 <button key={cat} className="flex-1 py-3 px-4 rounded-2xl border border-slate-100 hover:border-[#eb483f] transition-all text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#eb483f] bg-slate-50/50">
                    {cat}
                 </button>
               ))}
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Recipients</label>
             <select 
               value={targetType}
               onChange={(e) => setTargetType(e.target.value)}
               className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-black text-[#1a2b3c] outline-none transition-all focus:border-[#eb483f]"
             >
                <option>All Registered Players</option>
                <option>Players Booked for Tomorrow</option>
                <option>Coaching Students Only</option>
                <option>Active Players (Last 30 Days)</option>
             </select>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Message Body</label>
             <textarea 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Example: Facility will be closed tomorrow for floor maintenance. Sorry for the inconvenience!"
               className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold text-[#1a2b3c] outline-none transition-all focus:border-[#eb483f]"
             />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={!message || isSent}
            className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.25em] shadow-lg flex items-center justify-center gap-3 transition-all ${
              isSent
                ? 'bg-green-500 text-white shadow-green-500/20'
                : message
                  ? 'bg-[#eb483f] text-white shadow-[#eb483f]/20 hover:shadow-[#eb483f]/40 hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed text-white shadow-none'
            }`}
          >
            {isSent ? (
               <><CheckCircle2 size={18} /> Broadcast Sent!</>
            ) : (
               <><Send size={18} /> Launch Broadcast</>
            )}
          </motion.button>
        </div>
      </div>

      {/* 2. History & Preview */}
      <div className="space-y-6">
         {/* Live Preview */}
         <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Bookmark size={150} />
            </div>
            <div className="relative z-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-10">Broadcast Live Preview</h3>
               
               <div className="bg-white/5 rounded-2xl p-5 border border-white/10 italic">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-[#eb483f] flex items-center justify-center text-white">
                        <Megaphone size={16} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{targetType}</p>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Now Sending...</p>
                     </div>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-white/80 min-h-[40px]">
                     {message || 'Type something to see preview...'}
                  </p>
               </div>
            </div>
         </div>

         {/* History */}
         <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a2b3c] mb-6">Recent Broadcasts</h3>
            <div className="space-y-4">
               {[
                 { title: 'Maintenance Notice', date: 'Mar 24', icon: AlertCircle, color: '#eb483f' },
                 { title: 'New Tournament Launch', date: 'Mar 20', icon: Info, color: '#6366f1' },
                 { title: 'Happy Hour Offer', date: 'Mar 15', icon: Info, color: '#22c55e' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-slate-100 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-xl transition-all" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                          <item.icon size={16} />
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-[#1a2b3c] group-hover:text-[#eb483f] transition-all uppercase tracking-widest">{item.title}</p>
                          <p className="text-[9px] font-bold text-slate-400">{item.date} • Sent via App & SMS</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Broadcaster;
