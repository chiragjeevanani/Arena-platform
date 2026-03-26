import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, Clock, CreditCard, CheckCircle2, Search, Plus, Trash2 } from 'lucide-react';
import { ARENAS, COURTS, SLOTS } from '../../../../data/mockData';

const WalkInBooking = () => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isBooked, setIsBooked] = useState(false);

  const arenaId = 1; // Default for now
  const arenaCourts = COURTS.filter(c => c.arenaId === arenaId);

  const toggleSlot = (slot) => {
    if (selectedSlots.find(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBooking = () => {
    setIsBooked(true);
    setTimeout(() => setIsBooked(false), 3000);
    // Reset after booking
    setSelectedSlots([]);
    setCustomer({ name: '', phone: '', email: '' });
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((acc, s) => acc + s.price, 0).toFixed(3);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* 1. Selection Area */}
      <div className="xl:col-span-2 space-y-6">
        {/* Court Selection */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] mb-5 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#eb483f] rounded-full" />
            1. Select Court
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {arenaCourts.map(court => (
              <button
                key={court.id}
                onClick={() => setSelectedCourt(court)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedCourt?.id === court.id
                    ? 'border-[#eb483f] bg-[#eb483f]/5 text-[#eb483f]'
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCourt?.id === court.id ? 'bg-[#eb483f] text-white' : 'bg-slate-100'}`}>
                  <span className="text-xs font-black">{court.name.split(' ')[1]}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{court.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slot Selection */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] mb-5 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#6366f1] rounded-full" />
            2. Select Time Slots
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SLOTS.map(slot => (
              <button
                key={slot.id}
                disabled={slot.status !== 'Available'}
                onClick={() => toggleSlot(slot)}
                className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                  selectedSlots.find(s => s.id === slot.id)
                    ? 'border-[#6366f1] bg-[#6366f1]/5 text-[#6366f1]'
                    : slot.status === 'Available'
                      ? 'border-slate-100 hover:border-slate-200 text-slate-500'
                      : 'border-slate-100 bg-slate-50 opacity-40 grayscale cursor-not-allowed'
                }`}
              >
                <div className="relative z-10">
                   <p className="text-[9px] font-bold mb-1 opacity-70">{slot.time.split(' - ')[0]}</p>
                   <p className="text-xs font-black leading-none">OMR {slot.price.toFixed(3)}</p>
                </div>
                {selectedSlots.find(s => s.id === slot.id) && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Customer & Payment Area */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 sticky top-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] mb-5 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#22c55e] rounded-full" />
            3. Customer Details
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name"
                value={customer.name}
                onChange={e => setCustomer({...customer, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold focus:border-[#eb483f] outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Phone Number"
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold focus:border-[#eb483f] outline-none transition-all"
              />
            </div>

            <div className="h-px bg-slate-100 my-4" />

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Card', 'UPI'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      paymentMethod === m
                        ? 'bg-[#1a2b3c] border-[#1a2b3c] text-white'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-[#1a2b3c]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Items ({selectedSlots.length})</span>
                <span>OMR {calculateTotal()}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#eb483f]">Total</span>
                <span className="text-2xl font-black text-[#1a2b3c]">OMR {calculateTotal()}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={selectedSlots.length === 0 || !customer.name}
              onClick={handleBooking}
              className={`w-full py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all ${
                isBooked
                  ? 'bg-green-500 text-white shadow-green-500/20'
                  : selectedSlots.length > 0 && customer.name
                    ? 'bg-[#eb483f] text-white shadow-[#eb483f]/20 hover:shadow-[#eb483f]/40 hover:-translate-y-0.5'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isBooked ? (
                <><CheckCircle2 size={18} /> Booking confirmed!</>
              ) : (
                <><CreditCard size={18} /> Complete Booking</>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInBooking;
