import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Plus, X, ArrowRight, CalendarDays, Trash2, 
  Sun, Moon, Activity, ShieldCheck, 
  Timer, Zap, Star
} from 'lucide-react';

const INITIAL_SLOTS = {
  weekday: [
    { id: 's1', startTime: '06:00', endTime: '07:00', duration: 60, type: 'nonPrime' },
    { id: 's2', startTime: '07:00', endTime: '08:00', duration: 60, type: 'nonPrime' },
    { id: 's3', startTime: '08:00', endTime: '09:00', duration: 60, type: 'nonPrime' },
    { id: 's4', startTime: '17:00', endTime: '18:00', duration: 60, type: 'prime' },
    { id: 's5', startTime: '18:00', endTime: '19:00', duration: 60, type: 'prime' },
    { id: 's6', startTime: '19:00', endTime: '20:00', duration: 60, type: 'prime' },
    { id: 's7', startTime: '20:00', endTime: '21:00', duration: 60, type: 'prime' },
  ],
  weekend: [
    { id: 'sw1', startTime: '06:00', endTime: '07:30', duration: 90, type: 'nonPrime' },
    { id: 'sw2', startTime: '07:30', endTime: '09:00', duration: 90, type: 'nonPrime' },
    { id: 'sw3', startTime: '09:00', endTime: '10:30', duration: 90, type: 'nonPrime' },
    { id: 'sw4', startTime: '15:00', endTime: '16:30', duration: 90, type: 'prime' },
    { id: 'sw5', startTime: '16:30', endTime: '18:00', duration: 90, type: 'prime' },
  ],
};

const emptyForm = { startTime: '06:00', endTime: '07:00', duration: 60, type: 'nonPrime' };

const SlotConfig = () => {
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [activeTab, setActiveTab] = useState('weekday');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const addSlot = () => {
    if (!form.startTime || !form.endTime) return;
    setSlots(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], { id: `s${Date.now()}`, ...form, duration: Number(form.duration) }],
    }));
    setShowModal(false);
    setForm(emptyForm);
  };

  const removeSlot = (type, id) => {
    setSlots(prev => ({ ...prev, [type]: prev[type].filter(s => s.id !== id) }));
  };

  const currentSlots = slots[activeTab];
  const totalWeekday = slots.weekday.length;
  const totalWeekend = slots.weekend.length;
  const allSlots = [...slots.weekday, ...slots.weekend];
  const avgDuration = allSlots.length ? Math.round(allSlots.reduce((a, s) => a + s.duration, 0) / allSlots.length) : 0;
  const primeCount = allSlots.filter(s => s.type === 'prime').length;
  const nonPrimeCount = allSlots.filter(s => s.type === 'nonPrime').length;

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB]">
      <div className="mx-auto space-y-4 py-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-slate-200 bg-white p-4 shadow-sm rounded-sm">
           <div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#CE2029] mb-1">
                 <div className="w-3 h-[1.5px] bg-[#CE2029]" />
                 <Clock size={10} /> Operational Timeline
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#36454F] tracking-tight leading-none uppercase">Slot Configuration</h2>
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-slate-400" /> Define Prime &amp; Non-Prime time slots per day type
              </p>
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-sm">
                 {[
                   { label: 'Weekday', value: totalWeekday, color: 'text-[#36454F]' },
                   { label: 'Weekend', value: totalWeekend, color: 'text-[#CE2029]' },
                   { label: 'Prime', value: primeCount, color: 'text-amber-500' },
                   { label: 'Non-Prime', value: nonPrimeCount, color: 'text-slate-500' },
                 ].map((s, i) => (
                   <div key={i} className="px-3 py-1 flex flex-col border-r last:border-0 border-slate-200 min-w-[55px]">
                      <span className="text-[7.5px] font-black uppercase text-slate-600 tracking-widest leading-none mb-1">{s.label}</span>
                      <span className={`text-[12px] font-bold ${s.color} leading-none`}>{s.value.toString().padStart(2, '0')}</span>
                   </div>
                 ))}
              </div>
              <button 
                 onClick={() => setShowModal(true)}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-[#36454F] text-white hover:bg-black transition-all text-[9.5px] font-bold uppercase tracking-widest shadow-md active:translate-y-0.5"
              >
                 <Plus size={14} strokeWidth={3} /> Define Slot
              </button>
           </div>
        </div>

        {/* Compact Metrics Bar */}
        <div className="flex flex-wrap items-center gap-3">
           {[
             { label: 'Prime Slots', value: primeCount, icon: Star, color: '#f59e0b' },
             { label: 'Non-Prime', value: nonPrimeCount, icon: CalendarDays, color: '#6366f1' }
           ].map((stat, i) => (
             <div key={i} className="bg-white border border-slate-200 px-4 py-2.5 rounded-sm flex items-center gap-6 transition-all hover:bg-slate-50 shadow-sm min-w-[200px]">
                <div className="flex-1">
                   <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
                   <p className="text-sm font-black text-[#36454F] leading-tight">{stat.value.toString().padStart(2, '0')}</p>
                </div>
                <div className="w-7 h-7 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                   <stat.icon size={12} style={{ color: stat.color }} strokeWidth={3} />
                </div>
             </div>
           ))}
        </div>

        {/* Slot Type Legend */}
        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-sm px-4 py-2.5 shadow-sm">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Slot Type Legend:</span>
          <div className="flex items-center gap-1.5">
            <Star size={10} className="text-amber-500" fill="#f59e0b" />
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Prime — Higher Base Rate, High-Demand Hours</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <CalendarDays size={10} className="text-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Non-Prime — Standard Rate, Off-Peak Hours</span>
          </div>
        </div>

        {/* Tab System */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
           <div className="flex border-b border-slate-100 bg-slate-50/20">
              {[
                { key: 'weekday', label: 'Mon - Fri', icon: Sun },
                { key: 'weekend', label: 'Sat - Sun', icon: Moon },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 transition-all border-b-2 relative ${
                    activeTab === t.key
                      ? 'border-[#CE2029] text-[#36454F] bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}>
                  <t.icon size={14} /> 
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label} Registry</span>
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold ${activeTab === t.key ? 'bg-[#CE2029] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {slots[t.key].length}
                  </span>
                </button>
              ))}
           </div>

           {/* Slots Grid */}
           <div className="p-4 bg-slate-50/20">
              {currentSlots.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-sm">
                   <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">No Slots Defined</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <AnimatePresence>
                    {currentSlots.map((slot, idx) => {
                      const isPrime = slot.type === 'prime';
                      return (
                        <motion.div key={slot.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className={`group bg-white rounded-sm border p-3 flex flex-col hover:border-slate-400 transition-all shadow-sm ${
                            isPrime ? 'border-amber-200' : 'border-slate-200'
                          }`}
                        >
                          {/* Type Badge + Delete */}
                          <div className="flex items-center justify-between mb-4">
                             <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm border ${
                               isPrime 
                                 ? 'bg-amber-50 border-amber-200 text-amber-600' 
                                 : 'bg-slate-50 border-slate-100 text-slate-500'
                             }`}>
                                {isPrime 
                                  ? <Star size={8} fill="currentColor" /> 
                                  : <CalendarDays size={8} />
                                }
                                <span className="text-[7.5px] font-black uppercase tracking-widest">
                                  {isPrime ? 'Prime' : 'Non-Prime'}
                                </span>
                             </div>
                             <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => removeSlot(activeTab, slot.id)} className="w-6 h-6 flex items-center justify-center rounded-sm bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                   <Trash2 size={11} />
                                </button>
                             </div>
                          </div>

                          {/* Time Display */}
                          <div className="flex flex-col items-center justify-center space-y-2 mb-4">
                             <div className="flex items-center justify-between w-full px-2">
                                <div className="text-center">
                                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-0.5">Start</span>
                                   <span className="text-[16px] font-bold text-[#36454F] leading-none">{slot.startTime}</span>
                                </div>
                                <div className="w-px h-6 bg-slate-100" />
                                <div className="text-center">
                                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-0.5">End</span>
                                   <span className="text-[16px] font-bold text-[#36454F] leading-none">{slot.endTime}</span>
                                </div>
                             </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                             <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock size={11} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{slot.duration} Min</span>
                             </div>
                             {isPrime && (
                               <div className="flex items-center gap-1 text-amber-500">
                                 <Zap size={10} />
                                 <span className="text-[8px] font-black uppercase tracking-widest">High Rate</span>
                               </div>
                             )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Define Slot Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-sm rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">

              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#36454F]">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">Define Time Slot</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-1">New slot for {activeTab} schedule</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-[#36454F] transition-colors"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-5 bg-[#F9FAFB]/30">
                {/* Slot Type Selection */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Slot Classification</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'prime', label: 'Prime', icon: Star, desc: 'High-demand rate', color: 'amber' },
                      { value: 'nonPrime', label: 'Non-Prime', icon: CalendarDays, desc: 'Standard rate', color: 'slate' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setForm(p => ({ ...p, type: opt.value }))}
                        className={`p-3 rounded-sm border-2 text-left transition-all ${
                          form.type === opt.value
                            ? opt.value === 'prime' 
                              ? 'border-amber-400 bg-amber-50'
                              : 'border-slate-400 bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`flex items-center gap-1.5 mb-1 ${form.type === opt.value ? (opt.value === 'prime' ? 'text-amber-600' : 'text-slate-700') : 'text-slate-400'}`}>
                          <opt.icon size={12} fill={form.type === opt.value && opt.value === 'prime' ? 'currentColor' : 'none'} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                        </div>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Start Time</label>
                    <input type="time" value={form.startTime}
                      onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none focus:border-[#CE2029]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">End Time</label>
                    <input type="time" value={form.endTime}
                      onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none focus:border-[#CE2029]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Duration</label>
                  <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} className="w-full h-10 px-2 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase cursor-pointer">
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button onClick={addSlot}
                    className="w-full h-12 rounded-sm bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md">
                    Add Slot <Plus size={16} strokeWidth={3} />
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="w-full mt-2 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-[#36454F] transition-colors py-2">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlotConfig;
