import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, CreditCard, CheckCircle2, 
  Star, CalendarDays, Users, Edit3, AlertCircle,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { COURTS, SLOTS } from '../../../../data/mockData';

// Pricing config (in a real app, this would come from context/API)
const PRICING_CONFIG = {
  primeRate: 5.000,
  nonPrimeRate: 3.000,
  memberDiscountEnabled: true,
  memberDiscountPrime: 10,      // 10% off for members on Prime slots
  memberDiscountNonPrime: 15,   // 15% off for members on Non-Prime slots
};

const WalkInBooking = () => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [isMember, setIsMember] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isBooked, setIsBooked] = useState(false);
  const [adminOverrideEnabled, setAdminOverrideEnabled] = useState(false);
  const [adminOverridePrice, setAdminOverridePrice] = useState('');

  const arenaId = 1;
  const arenaCourts = COURTS.filter(c => c.arenaId === arenaId);

  const toggleSlot = (slot) => {
    if (slot.status !== 'Available') return;
    if (selectedSlots.find(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  // Dynamic pricing engine
  const calculateSlotPrice = (slot) => {
    const isPrime = slot.type === 'prime';
    let base = isPrime ? PRICING_CONFIG.primeRate : PRICING_CONFIG.nonPrimeRate;
    if (isMember && PRICING_CONFIG.memberDiscountEnabled) {
      const disc = isPrime ? PRICING_CONFIG.memberDiscountPrime : PRICING_CONFIG.memberDiscountNonPrime;
      base = base * (1 - disc / 100);
    }
    return base;
  };

  const calculateAutoTotal = () =>
    selectedSlots.reduce((acc, s) => acc + calculateSlotPrice(s), 0);

  const getFinalTotal = () => {
    if (adminOverrideEnabled && adminOverridePrice !== '') {
      return Number(adminOverridePrice);
    }
    return calculateAutoTotal();
  };

  const handleBooking = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setSelectedSlots([]);
      setCustomer({ name: '', phone: '', email: '' });
      setIsMember(false);
      setAdminOverrideEnabled(false);
      setAdminOverridePrice('');
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Court + Slot selection */}
      <div className="xl:col-span-2 space-y-5">

        {/* 1. Court Selection */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#CE2029] rounded-full" />
            1. Select Court
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {arenaCourts.map(court => (
              <button key={court.id} onClick={() => setSelectedCourt(court)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedCourt?.id === court.id
                    ? 'border-[#CE2029] bg-[#CE2029]/5 text-[#CE2029]'
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedCourt?.id === court.id ? 'bg-[#CE2029] text-white' : 'bg-slate-100'
                }`}>
                  <span className="text-xs font-black">{court.name.split(' ')[1]}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{court.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Slot Selection */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#6366f1] rounded-full" />
            2. Select Time Slots
          </h3>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Star size={10} className="text-amber-500" fill="#f59e0b" />
              <span className="text-[8.5px] font-black uppercase tracking-widest text-amber-600">Prime Slot</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <CalendarDays size={10} className="text-slate-400" />
              <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-500">Non-Prime Slot</span>
            </div>
            {isMember && (
              <>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <Users size={10} className="text-indigo-500" />
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-indigo-600">Member Price Applied</span>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SLOTS.map(slot => {
              const isPrime = slot.type === 'prime';
              const computedPrice = calculateSlotPrice(slot);
              const isSelected = !!selectedSlots.find(s => s.id === slot.id);
              const isAvailable = slot.status === 'Available';

              return (
                <button key={slot.id} disabled={!isAvailable} onClick={() => toggleSlot(slot)}
                  className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                    isSelected
                      ? isPrime
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-[#6366f1] bg-[#6366f1]/5 text-[#6366f1]'
                      : isAvailable
                        ? isPrime
                          ? 'border-amber-100 hover:border-amber-300 text-slate-600 bg-amber-50/30'
                          : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        : 'border-slate-100 bg-slate-50 opacity-40 grayscale cursor-not-allowed'
                  }`}>
                  {/* Slot type badge */}
                  <div className={`absolute top-1.5 left-1.5 ${isPrime ? 'text-amber-400' : 'text-slate-300'}`}>
                    {isPrime ? <Star size={8} fill="currentColor" /> : <CalendarDays size={8} />}
                  </div>

                  <div className="relative z-10 mt-2">
                    <p className="text-[8px] font-bold mb-1 opacity-70 leading-tight">{slot.time.split(' - ')[0]}</p>
                    <p className="text-xs font-black leading-none">OMR {computedPrice.toFixed(3)}</p>
                    {isMember && PRICING_CONFIG.memberDiscountEnabled && isAvailable && (
                      <p className="text-[7.5px] font-bold text-indigo-500 mt-0.5">
                        -{isPrime ? PRICING_CONFIG.memberDiscountPrime : PRICING_CONFIG.memberDiscountNonPrime}% disc.
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                  {!isAvailable && (
                    <div className="absolute bottom-1.5 right-1.5 text-[7px] font-black uppercase text-slate-400">
                      {slot.status}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Customer & Payment */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 sticky top-4 space-y-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#22c55e] rounded-full" />
            3. Customer Details
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Customer Name" value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-[#CE2029] outline-none transition-all" />
            </div>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Phone Number" value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-[#CE2029] outline-none transition-all" />
            </div>

            {/* ── Member Toggle ── */}
            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              isMember ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-2">
                <Users size={14} className={isMember ? 'text-indigo-600' : 'text-slate-400'} />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isMember ? 'text-indigo-700' : 'text-slate-600'}`}>
                    Member Booking
                  </p>
                  <p className="text-[8px] text-slate-500 font-bold mt-1 leading-none">
                    {isMember
                      ? `${PRICING_CONFIG.memberDiscountPrime}% Prime / ${PRICING_CONFIG.memberDiscountNonPrime}% Non-Prime`
                      : 'Toggle if customer has membership'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsMember(!isMember)}>
                {isMember
                  ? <ToggleRight size={24} className="text-indigo-600" />
                  : <ToggleLeft size={24} className="text-slate-300" />}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Payment Method */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'Card', 'UPI'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    paymentMethod === m
                      ? 'bg-[#36454F] border-[#36454F] text-white'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-[#36454F]'
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          {selectedSlots.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
              {selectedSlots.map(s => {
                const price = calculateSlotPrice(s);
                const isPrime = s.type === 'prime';
                return (
                  <div key={s.id} className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      {isPrime 
                        ? <Star size={9} className="text-amber-500" fill="#f59e0b" />
                        : <CalendarDays size={9} className="text-slate-400" />}
                      <span>{s.time.split(' - ')[0]}</span>
                      <span className={`text-[7.5px] font-black uppercase px-1 py-0.5 rounded-md ${
                        isPrime ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                      }`}>{isPrime ? 'Prime' : 'Non-Prime'}</span>
                    </div>
                    <span className="font-black text-[#36454F]">OMR {price.toFixed(3)}</span>
                  </div>
                );
              })}

              {isMember && (
                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Users size={9} />
                    <span>Member Discount Applied</span>
                  </div>
                  <span className="font-black text-green-500">✓ Active</span>
                </div>
              )}

              <div className="h-px bg-slate-200" />

              {/* Auto Total */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto Total</span>
                <span className={`text-lg font-black ${adminOverrideEnabled ? 'text-slate-300 line-through' : 'text-[#36454F]'}`}>
                  OMR {calculateAutoTotal().toFixed(3)}
                </span>
              </div>

              {/* ── Admin Override ── */}
              <div className={`rounded-xl border p-3 space-y-2.5 transition-all ${
                adminOverrideEnabled ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 size={12} className={adminOverrideEnabled ? 'text-orange-500' : 'text-slate-400'} />
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest leading-none ${adminOverrideEnabled ? 'text-orange-600' : 'text-slate-600'}`}>
                        Admin Price Override
                      </p>
                      <p className="text-[7.5px] text-slate-400 font-bold mt-0.5 leading-none">Final authority on booking price</p>
                    </div>
                  </div>
                  <button onClick={() => { setAdminOverrideEnabled(!adminOverrideEnabled); setAdminOverridePrice(''); }}>
                    {adminOverrideEnabled
                      ? <ToggleRight size={22} className="text-orange-500" />
                      : <ToggleLeft size={22} className="text-slate-300" />}
                  </button>
                </div>

                {adminOverrideEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-black text-xs">OMR</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder={calculateAutoTotal().toFixed(3)}
                        value={adminOverridePrice}
                        onChange={e => setAdminOverridePrice(e.target.value)}
                        className="w-full pl-12 pr-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-black outline-none focus:border-orange-400 text-orange-600"
                      />
                    </div>
                    {adminOverridePrice !== '' && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle size={10} className="text-orange-500" />
                        <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest">
                          Override active — auto pricing bypassed
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Final Total */}
              <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#CE2029]">Final Total</span>
                <span className={`text-2xl font-black ${adminOverrideEnabled && adminOverridePrice ? 'text-orange-500' : 'text-[#36454F]'}`}>
                  OMR {getFinalTotal().toFixed(3)}
                </span>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <motion.button whileTap={{ scale: 0.98 }}
            disabled={selectedSlots.length === 0 || !customer.name}
            onClick={handleBooking}
            className={`w-full py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all ${
              isBooked
                ? 'bg-green-500 text-white shadow-green-500/20'
                : selectedSlots.length > 0 && customer.name
                  ? 'bg-[#CE2029] text-white shadow-[#CE2029]/20 hover:shadow-[#CE2029]/40 hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}>
            {isBooked
              ? <><CheckCircle2 size={18} /> Booking Confirmed!</>
              : <><CreditCard size={18} /> Complete Booking</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default WalkInBooking;
