import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowLeft, Clock, BadgeDollarSign, 
  Settings2, Activity, Info, Edit3, Trash2, Plus, X, Save, Star, CalendarDays
} from 'lucide-react';
import { listAdminCourtSlots, createAdminCourtSlot, deleteAdminCourtSlot } from '../../../services/adminSlotApi';
import { useEffect } from 'react';

const CourtSlotsAdmin = () => {
  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const [isEachDay, setIsEachDay] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [editingSlot, setEditingSlot] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ startTime: '06:00', endTime: '07:00', price: '3.000', type: 'Normal', slotClass: 'nonPrime', status: 'Available' });
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const GROUP_MAP = {
    'Weekdays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    'Weekend': ['Sat', 'Sun']
  };

  const currentTabDays = isEachDay 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Weekdays', 'Weekend'];

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const dayToFetch = isEachDay ? selectedDay : GROUP_MAP[selectedDay][0];
      const data = await listAdminCourtSlots(arenaId, courtId, dayToFetch);
      setTimeSlots(data.slots || []);
    } catch (e) {
      console.error('Failed to fetch slots:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [arenaId, courtId, selectedDay]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const deleteSlot = async (id) => {
    try {
      await deleteAdminCourtSlot(id);
      setTimeSlots(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e.name === 'AbortError' ? 'Process cancelled' : (e.message || 'Delete failed'));
    }
  };

  const openAddModal = () => {
    setAddForm({ startTime: '06:00', endTime: '07:00', price: '3.000', type: 'Normal', slotClass: 'nonPrime', status: 'Available' });
    setShowAddModal(true);
  };

  const confirmAddSlot = async () => {
    if (!addForm.startTime || !addForm.endTime) return;
    const formatTime = (t) => {
      const [h, m] = t.split(':');
      const hour = parseInt(h);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${String(displayHour).padStart(2,'0')}:${m} ${period}`;
    };
    
    const daysToUpdate = isEachDay ? [selectedDay] : GROUP_MAP[selectedDay];
    
    try {
      await Promise.all(daysToUpdate.map(day => {
        const body = {
          dayOfWeek: day,
          timeSlot: `${formatTime(addForm.startTime)} - ${formatTime(addForm.endTime)}`,
          startTime: addForm.startTime,
          endTime: addForm.endTime,
          price: parseFloat(addForm.price) || 0,
          slotClass: addForm.slotClass,
          type: addForm.type,
          status: addForm.status,
        };
        return createAdminCourtSlot(arenaId, courtId, body);
      }));

      fetchSlots();
      setShowAddModal(false);
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  };

  const saveSlot = async (updatedSlot) => {
    const daysToUpdate = isEachDay ? [selectedDay] : GROUP_MAP[selectedDay];

    try {
      await Promise.all(daysToUpdate.map(day => {
        const body = {
          dayOfWeek: day,
          timeSlot: updatedSlot.time,
          price: parseFloat(String(updatedSlot.price).replace(/[^0-9.]/g, '')) || 0,
          slotClass: updatedSlot.slotClass,
          type: updatedSlot.type,
          status: updatedSlot.status,
        };
        return createAdminCourtSlot(arenaId, courtId, body);
      }));
      
      fetchSlots();
      setEditingSlot(null);
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#CE2029] hover:border-[#CE2029]/20 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029] mb-1">
                <Building2 size={12} /> Arena Management Portal
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Court {courtId} Slot Schedule
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-white px-4 py-2 border border-slate-100 shadow-sm flex items-center gap-3">
               <Activity size={16} className="text-emerald-500" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Status</span>
                  <span className="text-[11px] font-bold text-slate-900 uppercase">Operational</span>
               </div>
            </div>
            <button className="bg-white p-3 border border-slate-100 text-slate-400 hover:text-[#CE2029] transition-all shadow-sm">
                <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Day Selector - High Density */}
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-100 p-1.5 shadow-sm inline-flex gap-1 overflow-x-auto no-scrollbar max-w-full">
            {currentTabDays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                  selectedDay === day 
                  ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20' 
                  : 'text-[#36454F] hover:text-[#CE2029] hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 bg-white px-6 py-3 border border-slate-100 shadow-sm ml-auto rounded-xl transition-all hover:shadow-md">
             <div className="flex flex-col text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 leading-none mb-1">Schedule Control</span>
                <span className={`text-[8.5px] font-bold uppercase tracking-widest transition-colors ${isEachDay ? 'text-[#CE2029]' : 'text-slate-400'}`}>
                   {isEachDay ? 'Each Day Active' : 'Grouped View'}
                </span>
             </div>
             <button 
               onClick={() => {
                 const newIsEachDay = !isEachDay;
                 setIsEachDay(newIsEachDay);
                 setSelectedDay(newIsEachDay ? 'Mon' : 'Weekdays');
               }}
               className="w-12 h-6 rounded-full transition-all flex items-center relative shadow-inner overflow-hidden border border-slate-100"
               style={{ backgroundColor: isEachDay ? '#CE2029' : '#E2E8F0' }}
             >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform flex items-center justify-center ${
                  isEachDay ? 'translate-x-[26px]' : 'translate-x-[2px]'
                }`}>
                   <div className={`w-1 h-1 rounded-full ${isEachDay ? 'bg-[#CE2029]' : 'bg-slate-300'}`} />
                </div>
             </button>
          </div>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {loading ? (
             <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Syncing with Schedule Registry...
             </div>
          ) : timeSlots.map((slot) => (
            <motion.div
              layout
              key={slot.id}
              className={`relative p-6 border-2 transition-all group ${
                slot.status === 'Available' ? 'bg-white border-emerald-500/10 hover:border-emerald-500 shadow-sm hover:shadow-emerald-500/10' :
                slot.status === 'Booked' ? 'bg-slate-50 border-slate-200 opacity-80' :
                slot.status === 'Coaching' ? 'bg-white border-amber-500/10 hover:border-amber-500 shadow-sm hover:shadow-amber-500/10' :
                'bg-slate-100 border-slate-200'
              }`}
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                slot.status === 'Available' ? 'bg-emerald-500' :
                slot.status === 'Booked' ? 'bg-slate-400' :
                slot.status === 'Coaching' ? 'bg-amber-500' :
                'bg-slate-300'
              }`} />

              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${
                  slot.status === 'Available' ? 'bg-emerald-50 text-emerald-600' :
                  slot.status === 'Booked' ? 'bg-slate-100 text-slate-500' :
                  slot.status === 'Coaching' ? 'bg-amber-50 text-amber-600' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  <Clock size={16} />
                </div>
                
                {/* Actions Area */}
                <div className="flex gap-1">
                  <button 
                    onClick={() => setEditingSlot(slot)}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-[#CE2029] hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={() => deleteSlot(slot.id)}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                {/* Prime / Non-Prime badge */}
                <div className="flex items-center gap-2 mb-2">
                  {slot.slotClass === 'prime' ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 border border-amber-200 rounded">
                      <Star size={9} fill="#f59e0b" className="text-amber-500" />
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-700">Prime</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">
                      <CalendarDays size={9} className="text-slate-400" />
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-500">Non-Prime</span>
                    </div>
                  )}
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 inline-block ${
                    slot.status === 'Available' ? 'bg-emerald-50 text-emerald-600' :
                    slot.status === 'Booked' ? 'bg-slate-100 text-slate-600' :
                    slot.status === 'Coaching' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-200 text-slate-500'
                  }`}>{slot.type}</span>
                </div>
                <h3 className="text-[13px] font-black tracking-tight text-slate-900 leading-none">
                  {slot.timeSlot || slot.time}
                </h3>
                {slot.price !== undefined ? (
                  <div className="flex items-center gap-1 text-[#CE2029] pt-1 mt-1">
                    <BadgeDollarSign size={12} strokeWidth={3} />
                    <span className="text-[12px] font-black uppercase">OMR {Number(slot.price).toFixed(3)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 pt-1 mt-1">
                    <Info size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{slot.status}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* New Slot Creation Card */}
          <button 
            onClick={openAddModal}
            className="aspect-[4/3] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#CE2029]/30 hover:text-[#CE2029] hover:bg-[#CE2029]/[0.02] transition-all group"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center group-hover:bg-[#CE2029]/10 transition-all mb-1">
              <Plus size={24} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add New Time Slot</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-100">
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-500 shadow-md shadow-emerald-500/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Publicly Available</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-400 shadow-md shadow-slate-400/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reserved / Booked</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-500 shadow-md shadow-amber-500/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Coaching Program</span>
           </div>
        </div>

        {/* Slot Editor Overlay */}
        <AnimatePresence>
          {editingSlot && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                onClick={() => setEditingSlot(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[400px] max-w-[95%] bg-white p-8 shadow-2xl border-t-8 border-[#CE2029]"
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-1">Configuration Terminal</p>
                     <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Edit Schedule Slot</h2>
                   </div>
                   <button onClick={() => setEditingSlot(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                     <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Time Range</label>
                    <input 
                      type="text" value={editingSlot.time} 
                      onChange={e => setEditingSlot({...editingSlot, time: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Rate (OMR)</label>
                      <input 
                        type="text" value={editingSlot.price || '0.000'} 
                        onChange={e => setEditingSlot({...editingSlot, price: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Categorization</label>
                      <select 
                        value={editingSlot.type}
                        onChange={e => setEditingSlot({...editingSlot, type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white appearance-none"
                      >
                        <option>Normal</option>
                        <option>Peak</option>
                        <option>Academy</option>
                        <option>Customer</option>
                        <option>Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Prime / Non-Prime Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Slot Classification</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'prime', label: 'Prime', icon: Star, desc: 'High-demand / higher rate' },
                        { value: 'nonPrime', label: 'Non-Prime', icon: CalendarDays, desc: 'Standard / lower rate' },
                      ].map(opt => (
                        <button key={opt.value}
                          onClick={() => setEditingSlot({...editingSlot, slotClass: opt.value})}
                          className={`p-3 border-2 text-left transition-all ${
                            editingSlot.slotClass === opt.value
                              ? opt.value === 'prime'
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-slate-400 bg-slate-50'
                              : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}>
                          <div className={`flex items-center gap-1.5 mb-1 ${
                            editingSlot.slotClass === opt.value
                              ? opt.value === 'prime' ? 'text-amber-600' : 'text-slate-700'
                              : 'text-slate-600'
                          }`}>
                            <opt.icon size={11} fill={editingSlot.slotClass === opt.value && opt.value === 'prime' ? 'currentColor' : 'none'} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                          </div>
                          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wide">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">Operational Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Available', 'Booked', 'Coaching', 'Blocked'].map(status => (
                          <button
                            key={status}
                            onClick={() => setEditingSlot({...editingSlot, status})}
                            className={`py-2 text-[9px] font-black uppercase tracking-tighter border transition-all ${
                              editingSlot.status === status 
                              ? 'bg-slate-900 text-white border-slate-900' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                  </div>

                  <button 
                    onClick={() => saveSlot(editingSlot)}
                    className="w-full py-4 bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#CE2029]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Update Configuration
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Add New Slot Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                onClick={() => setShowAddModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[420px] max-w-[95%] bg-white p-8 shadow-2xl border-t-8 border-[#CE2029]"
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-1">Configuration Terminal</p>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Define New Slot</h2>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Start Time</label>
                      <input type="time" value={addForm.startTime}
                        onChange={e => setAddForm(p => ({ ...p, startTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">End Time</label>
                      <input type="time" value={addForm.endTime}
                        onChange={e => setAddForm(p => ({ ...p, endTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029]" />
                    </div>
                  </div>

                  {/* Slot Classification — Prime / Non-Prime */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Slot Classification</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'prime', label: 'Prime', icon: Star, desc: 'High-demand / higher rate' },
                        { value: 'nonPrime', label: 'Non-Prime', icon: CalendarDays, desc: 'Standard / lower rate' },
                      ].map(opt => (
                        <button key={opt.value}
                          onClick={() => setAddForm(p => ({ ...p, slotClass: opt.value }))}
                          className={`p-3 border-2 text-left transition-all ${
                            addForm.slotClass === opt.value
                              ? opt.value === 'prime'
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-slate-400 bg-slate-50'
                              : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}>
                          <div className={`flex items-center gap-1.5 mb-1 ${
                            addForm.slotClass === opt.value
                              ? opt.value === 'prime' ? 'text-amber-600' : 'text-slate-700'
                              : 'text-slate-600'
                          }`}>
                            <opt.icon size={11} fill={addForm.slotClass === opt.value && opt.value === 'prime' ? 'currentColor' : 'none'} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                          </div>
                          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wide">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Rate (OMR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xs">OMR</span>
                      <input type="number" step="0.001" value={addForm.price}
                        onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 text-sm font-black text-slate-900 outline-none focus:border-[#CE2029]" />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Initial Status</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Available', 'Booked', 'Coaching', 'Blocked'].map(status => (
                        <button key={status}
                          onClick={() => setAddForm(p => ({ ...p, status }))}
                          className={`py-2 text-[9px] font-black uppercase tracking-tighter border transition-all ${
                            addForm.status === status
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={confirmAddSlot}
                    className="w-full py-4 bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#CE2029]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Create Slot
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CourtSlotsAdmin;
