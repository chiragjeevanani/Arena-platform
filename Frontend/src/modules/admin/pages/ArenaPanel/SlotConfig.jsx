import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, X, ArrowRight, CalendarDays, Trash2, Sun, Moon, Copy } from 'lucide-react';

const INITIAL_SLOTS = {
  weekday: [
    { id: 's1', startTime: '06:00', endTime: '07:00', duration: 60 },
    { id: 's2', startTime: '07:00', endTime: '08:00', duration: 60 },
    { id: 's3', startTime: '08:00', endTime: '09:00', duration: 60 },
    { id: 's4', startTime: '17:00', endTime: '18:00', duration: 60 },
    { id: 's5', startTime: '18:00', endTime: '19:00', duration: 60 },
    { id: 's6', startTime: '19:00', endTime: '20:00', duration: 60 },
    { id: 's7', startTime: '20:00', endTime: '21:00', duration: 60 },
  ],
  weekend: [
    { id: 'sw1', startTime: '06:00', endTime: '07:30', duration: 90 },
    { id: 'sw2', startTime: '07:30', endTime: '09:00', duration: 90 },
    { id: 'sw3', startTime: '09:00', endTime: '10:30', duration: 90 },
    { id: 'sw4', startTime: '15:00', endTime: '16:30', duration: 90 },
    { id: 'sw5', startTime: '16:30', endTime: '18:00', duration: 90 },
  ],
};

const emptyForm = { startTime: '06:00', endTime: '07:00', duration: 60 };

// Helper to determine time of day for slot styling
const getTimeOfDay = (timeStr) => {
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour < 12) return { label: 'Morning', color: 'text-amber-500', bg: 'bg-amber-50' };
  if (hour < 17) return { label: 'Afternoon', color: 'text-orange-500', bg: 'bg-orange-50' };
  return { label: 'Evening', color: 'text-indigo-500', bg: 'bg-indigo-50' };
};

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

  // Calculate stats
  const totalWeekday = slots.weekday.length;
  const totalWeekend = slots.weekend.length;
  const allSlots = [...slots.weekday, ...slots.weekend];
  const avgDuration = allSlots.length ? Math.round(allSlots.reduce((a, s) => a + s.duration, 0) / allSlots.length) : 0;

  const inputCls = "w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c] shadow-sm";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Weekday Slots', value: totalWeekday, icon: Sun, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Weekend Slots', value: totalWeekend, icon: Moon, color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Total Active', value: totalWeekday + totalWeekend, icon: CalendarDays, color: '#10b981', bg: '#d1fae5' },
          { label: 'Avg Duration', value: `${avgDuration}m`, icon: Clock, color: '#ef4444', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#1a2b3c] leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {[
            { key: 'weekday', label: 'Weekday Configuration', icon: Sun },
            { key: 'weekend', label: 'Weekend Configuration', icon: Moon },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-5 px-4 transition-all border-b-2 relative overflow-hidden ${
                activeTab === t.key
                  ? 'border-[#eb483f] text-[#eb483f] bg-white'
                  : 'border-transparent text-slate-500 hover:text-[#1a2b3c] hover:bg-slate-100/50'
              }`}>
              <div className="flex items-center gap-2 relative z-10">
                <t.icon size={18} strokeWidth={activeTab === t.key ? 2.5 : 2} /> 
                <span className="text-sm font-semibold tracking-wide">{t.label}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold relative z-10 hidden sm:inline-block ${
                activeTab === t.key ? 'bg-red-50 text-[#eb483f]' : 'bg-slate-200 text-slate-600'
              }`}>
                {slots[t.key].length} Slots
              </span>
              {/* Subtle background highlight for active tab */}
              {activeTab === t.key && (
                <div className="absolute inset-0 bg-gradient-to-t from-red-50 to-transparent opacity-50 pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Slot Grid Container */}
        <div className="p-6 md:p-8 bg-slate-50/30">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-md font-bold text-[#1a2b3c]">
                {activeTab === 'weekday' ? 'Monday - Friday' : 'Saturday & Sunday'}
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Manage available time slots and durations</p>
            </div>
            
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#eb483f] text-white text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg hover:shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all">
              <Plus size={16} strokeWidth={2.5} /> Add Slot
            </button>
          </div>

          {currentSlots.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">No time slots found</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Click the Add Slot button above to start configuring availability for {activeTab}s.</p>
              <button onClick={() => setShowModal(true)} className="mt-6 text-[#eb483f] text-sm font-bold hover:underline">
                + Create First Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {currentSlots.map((slot, idx) => {
                  const timeStyle = getTimeOfDay(slot.startTime);
                  return (
                    <motion.div key={slot.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#eb483f]/40 hover:shadow-lg hover:shadow-[#eb483f]/5 transition-all relative overflow-hidden"
                    >
                      {/* Delete Button */}
                      <button onClick={() => removeSlot(activeTab, slot.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10">
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>

                      {/* Time Indicator Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${timeStyle.bg} mb-4`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${timeStyle.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${timeStyle.color}`}>
                          {timeStyle.label}
                        </span>
                      </div>

                      {/* Times */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start</p>
                          <p className="text-2xl font-black text-[#1a2b3c] leading-none">{slot.startTime}</p>
                        </div>
                        <div className="w-8 flex justify-center">
                          <ArrowRight size={16} className="text-slate-300" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End</p>
                          <p className="text-2xl font-black text-[#1a2b3c] leading-none">{slot.endTime}</p>
                        </div>
                      </div>

                      {/* Footer/Duration */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={13} strokeWidth={2.5} />
                          <span className="text-[11px] font-bold">{slot.duration} mins</span>
                        </div>
                        <button className="text-[10px] font-bold text-slate-400 hover:text-[#eb483f] uppercase tracking-wider truncate">
                          Edit
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#0d1526]/40 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-[2rem] bg-white border border-slate-200 shadow-2xl overflow-hidden">

              <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <Clock className="text-[#eb483f]" size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-[#1a2b3c]">Add Time Slot</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Configure for {activeTab === 'weekday' ? 'Mon-Fri' : 'Sat-Sun'}</p>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors shadow-sm">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Start Time</label>
                    <input type="time" value={form.startTime}
                      onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">End Time</label>
                    <input type="time" value={form.endTime}
                      onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Duration (Minutes)</label>
                  <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} className={inputCls}>
                    <option value={30}>30 mins (Quick Session)</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins (Standard Class)</option>
                    <option value={90}>90 mins (Match / Event)</option>
                    <option value={120}>120 mins</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button onClick={addSlot}
                    className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all">
                    Confirm & Add Slot <Plus size={16} strokeWidth={3} />
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="w-full mt-3 py-3 text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
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
