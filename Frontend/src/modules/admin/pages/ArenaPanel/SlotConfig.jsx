import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Plus, X, ArrowRight, CalendarDays, Trash2, 
  Sun, Moon, Activity, ShieldCheck, 
  Timer, Zap, Star, Loader2, ChevronRight
} from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { listMyCourtSlots, createMyCourtSlot, deleteMyCourtSlot } from '../../../../services/arenaStaffApi';
import { showToast } from '../../../../utils/toast';

const emptyForm = { startTime: '06:00', endTime: '07:00', type: 'nonPrime', status: 'Available' };

const DAY_GROUPS = {
  weekday: { label: 'Mon - Fri', days: [1, 2, 3, 4, 5] },
  weekend: { label: 'Sat - Sun', days: [6, 0] }
};

const DAY_MAP = {
  1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun'
};

const SlotConfig = () => {
  const { courts, loading: arenaLoading } = useArenaPanel();
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [isEachDay, setIsEachDay] = useState(false); // DEFAULT FALSE for Arena Admin as they usually set templates
  const [activeTab, setActiveTab] = useState('weekday');
  const [slotsByDay, setSlotsByDay] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const GROUP_MAP = {
    'weekday': [1, 2, 3, 4, 5],
    'weekend': [6, 0]
  };

  const currentTabGroups = useMemo(() => isEachDay 
    ? Object.fromEntries(Object.entries(DAY_MAP).map(([k, v]) => [v, { label: v, days: [Number(k)] }]))
    : DAY_GROUPS, [isEachDay]);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts, selectedCourtId]);

  const fetchSlots = useCallback(async () => {
    if (!selectedCourtId) return;
    setLoadingSlots(true);
    try {
      const dayNums = currentTabGroups[activeTab].days;
      // Fetch for first day of group to represent the template, or just show all
      const res = await listMyCourtSlots(selectedCourtId, DAY_MAP[dayNums[0]]);
      setSlotsByDay(prev => ({ ...prev, [activeTab]: res.slots }));
    } catch (err) {
      showToast('Failed to load slots', 'error');
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedCourtId, activeTab, currentTabGroups]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const addSlot = async () => {
    if (!form.startTime || !form.endTime || !selectedCourtId) return;
    setSaving(true);
    try {
      const dayNums = currentTabGroups[activeTab].days;
      const timeSlot = `${form.startTime}-${form.endTime}`;
      
      // We apply to ALL days in the group for better UX
      await Promise.all(dayNums.map(dayNum => 
        createMyCourtSlot(selectedCourtId, {
          dayOfWeek: DAY_MAP[dayNum],
          timeSlot,
          startTime: form.startTime,
          endTime: form.endTime,
          slotClass: form.type, // backend expects slotClass
          status: form.status
        })
      ));

      showToast(`Slots registered to ${currentTabGroups[activeTab].label}`, 'success');
      fetchSlots();
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      showToast('Failed to add slots', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (slotId) => {
    try {
      await deleteMyCourtSlot(slotId);
      showToast('Slot removed', 'success');
      fetchSlots();
    } catch (err) {
      showToast('Failed to remove slot', 'error');
    }
  };

  const currentSlots = slotsByDay[activeTab] || [];
  const primeCount = currentSlots.filter(s => s.slotClass === 'prime').length;
  const nonPrimeCount = currentSlots.filter(s => s.slotClass !== 'prime').length;

  if (arenaLoading && courts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-[#CE2029] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB]">
      <div className="mx-auto space-y-4 py-4">
        
        {/* Court Selector */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-sm border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Select Dimension:</span>
           {courts.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCourtId(c.id)}
                className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                  selectedCourtId === c.id 
                    ? 'bg-[#36454F] border-[#36454F] text-white shadow-lg' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {c.name}
              </button>
           ))}
        </div>

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
                   { label: 'Total', value: currentSlots.length, color: 'text-[#36454F]' },
                   { label: 'Prime', value: primeCount, color: 'text-amber-500' },
                   { label: 'Non-Prime', value: nonPrimeCount, color: 'text-slate-500' },
                 ].map((s, i) => (
                    <div key={i} className="px-3 py-1 flex flex-col border-r last:border-0 border-slate-200 min-w-[55px]">
                       <span className="text-[7.5px] font-black uppercase text-slate-600 tracking-widest leading-none mb-1">{s.label}</span>
                       <span className={`text-[12px] font-bold ${s.color} leading-none`}>{s.value.toString().padStart(2, '0')}</span>
                    </div>
                 ))}
              </div>

              {/* Each Day Toggle - Premium UI */}
              <div className="flex items-center gap-4 bg-white px-5 py-2 border border-slate-100 shadow-sm rounded-xl transition-all hover:shadow-md">
                 <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-900 leading-none mb-1">View Control</span>
                    <span className={`text-[7px] font-bold uppercase tracking-widest transition-colors ${isEachDay ? 'text-[#CE2029]' : 'text-slate-400'}`}>
                       {isEachDay ? 'Each Day Mode' : 'Grouped View'}
                    </span>
                 </div>
                 <button 
                   onClick={() => {
                     const newIsEachDay = !isEachDay;
                     setIsEachDay(newIsEachDay);
                     setActiveTab(newIsEachDay ? 'Mon' : 'weekday');
                   }}
                   className="w-10 h-5 rounded-full transition-all flex items-center relative shadow-inner overflow-hidden border border-slate-100"
                   style={{ backgroundColor: isEachDay ? '#CE2029' : '#E2E8F0' }}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all transform flex items-center justify-center ${
                      isEachDay ? 'translate-x-[22px]' : 'translate-x-[1px]'
                    }`}>
                       <div className={`w-1 h-1 rounded-full ${isEachDay ? 'bg-[#CE2029]' : 'bg-slate-300'}`} />
                    </div>
                 </button>
              </div>

              <button 
                 disabled={!selectedCourtId}
                 onClick={() => setShowModal(true)}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-[#36454F] text-white hover:bg-black transition-all text-[9.5px] font-bold uppercase tracking-widest shadow-md active:translate-y-0.5 disabled:opacity-50"
              >
                 <Plus size={14} strokeWidth={3} /> Define Slot
              </button>
           </div>
        </div>

        {/* Tab System */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
           <div className="flex border-b border-slate-100 bg-slate-50/20 overflow-x-auto scrollbar-hide">
              {Object.keys(currentTabGroups).map(key => {
                const t = currentTabGroups[key];
                const Icon = isEachDay ? (activeTab === key ? Star : Clock) : (key === 'weekday' ? Sun : Moon);
                return (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 flex items-center justify-center gap-2 min-w-[80px] py-3 transition-all border-b-2 relative ${
                      activeTab === key
                        ? 'border-[#CE2029] text-[#36454F] bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}>
                    <Icon size={12} className={activeTab === key ? 'text-[#CE2029]' : 'text-slate-400'} /> 
                    <span className="text-[9px] font-black uppercase tracking-widest">{isEachDay ? key : t.label}</span>
                    {loadingSlots && activeTab === key && <Loader2 size={10} className="animate-spin text-[#CE2029]" />}
                  </button>
                );
              })}
           </div>

           {/* Slots Grid */}
           <div className="p-4 bg-slate-50/20">
              {loadingSlots ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-[#CE2029] animate-spin" />
                </div>
              ) : currentSlots.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-sm">
                   <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">No Slots Defined for this Node Cluster</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <AnimatePresence>
                    {currentSlots.map((slot, idx) => {
                      const isPrime = slot.slotClass === 'prime';
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
                                <button onClick={() => removeSlot(slot.id)} className="w-6 h-6 flex items-center justify-center rounded-sm bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
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
                             {isPrime && (
                               <div className="flex items-center gap-1 text-amber-500">
                                 <Zap size={10} />
                                 <span className="text-[8px] font-black uppercase tracking-widest">High Rate</span>
                               </div>
                             )}
                             <div className="flex items-center gap-1 text-slate-400">
                                <Activity size={10} />
                                <span className="text-[8.5px] font-bold uppercase">{slot.status}</span>
                             </div>
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
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mt-1">Applying to {currentTabGroups[activeTab].label} Cluster</p>
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

                <div className="pt-2">
                  <button onClick={addSlot} disabled={saving}
                    className="w-full h-12 rounded-sm bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md">
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    {saving ? 'Registering...' : 'Add Slot'} <Plus size={16} strokeWidth={3} />
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
