import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowLeft, Clock, BadgeDollarSign, 
  Settings2, Activity, Info, Edit3, Trash2, Plus, X, Save
} from 'lucide-react';

const CourtSlotsAdmin = () => {
  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [editingSlot, setEditingSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, time: '05:00 AM - 06:00 AM', status: 'Available', price: 'OMR 3.000', type: 'Normal' },
    { id: 2, time: '06:00 AM - 07:00 AM', status: 'Booked', price: null, type: 'Customer' },
    { id: 3, time: '07:00 AM - 08:00 AM', status: 'Coaching', price: null, type: 'Academy' },
    { id: 4, time: '08:00 AM - 09:00 AM', status: 'Available', price: 'OMR 4.000', type: 'Peak' },
    { id: 5, time: '09:00 AM - 10:00 AM', status: 'Available', price: 'OMR 4.000', type: 'Peak' },
    { id: 6, time: '10:00 AM - 11:00 AM', status: 'Blocked', price: null, type: 'Maintenance' },
    { id: 7, time: '11:00 AM - 12:00 PM', status: 'Available', price: 'OMR 3.000', type: 'Normal' },
    { id: 8, time: '12:00 PM - 01:00 PM', status: 'Available', price: 'OMR 3.000', type: 'Normal' },
  ]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const deleteSlot = (id) => {
    setTimeSlots(prev => prev.filter(s => s.id !== id));
  };

  const addSlot = () => {
    const newSlot = { 
      id: Date.now(), 
      time: 'New Slot Time', 
      status: 'Available', 
      price: 'OMR 0.000', 
      type: 'Normal' 
    };
    setTimeSlots([...timeSlots, newSlot]);
    setEditingSlot(newSlot);
  };

  const saveSlot = (updatedSlot) => {
    setTimeSlots(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
    setEditingSlot(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#eb483f] hover:border-[#eb483f]/20 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#eb483f] mb-1">
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
            <button className="bg-white p-3 border border-slate-100 text-slate-400 hover:text-[#eb483f] transition-all shadow-sm">
                <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Day Selector - High Density */}
        <div className="bg-white border border-slate-100 p-1.5 shadow-sm inline-flex gap-1 overflow-x-auto no-scrollbar max-w-full">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                selectedDay === day 
                ? 'bg-[#eb483f] text-white shadow-lg shadow-[#eb483f]/20' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {timeSlots.map((slot) => (
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
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-[#eb483f] hover:bg-white border border-transparent hover:border-slate-100 transition-all"
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
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 mb-1 inline-block ${
                  slot.status === 'Available' ? 'bg-emerald-50 text-emerald-600' :
                  slot.status === 'Booked' ? 'bg-slate-100 text-slate-600' :
                  slot.status === 'Coaching' ? 'bg-amber-50 text-amber-600' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {slot.type}
                </span>
                <h3 className="text-[13px] font-black tracking-tight text-slate-900 leading-none">
                  {slot.time}
                </h3>
                {slot.price ? (
                  <div className="flex items-center gap-1 text-[#eb483f] pt-1 mt-1">
                    <BadgeDollarSign size={12} strokeWidth={3} />
                    <span className="text-[12px] font-black uppercase">{slot.price}</span>
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
            onClick={addSlot}
            className="aspect-[4/3] border-3 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#eb483f]/30 hover:text-[#eb483f] hover:bg-[#eb483f]/[0.02] transition-all group"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center group-hover:bg-[#eb483f]/10 transition-all mb-1">
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
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[400px] max-w-[95%] bg-white p-8 shadow-2xl border-t-8 border-[#eb483f]"
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#eb483f] mb-1">Configuration Terminal</p>
                     <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Edit Schedule Slot</h2>
                   </div>
                   <button onClick={() => setEditingSlot(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                     <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Time Range</label>
                    <input 
                      type="text" value={editingSlot.time} 
                      onChange={e => setEditingSlot({...editingSlot, time: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Rate (Currency)</label>
                      <input 
                        type="text" value={editingSlot.price || '0.000'} 
                        onChange={e => setEditingSlot({...editingSlot, price: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categorization</label>
                      <select 
                        value={editingSlot.type}
                        onChange={e => setEditingSlot({...editingSlot, type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white appearance-none"
                      >
                        <option>Normal</option>
                        <option>Peak</option>
                        <option>Academy</option>
                        <option>Customer</option>
                        <option>Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operational Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Available', 'Booked', 'Coaching', 'Blocked'].map(status => (
                          <button
                            key={status}
                            onClick={() => setEditingSlot({...editingSlot, status})}
                            className={`py-2 text-[9px] font-black uppercase tracking-tighter border transition-all ${
                              editingSlot.status === status 
                              ? 'bg-slate-900 text-white border-slate-900' 
                              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                  </div>

                  <button 
                    onClick={() => saveSlot(editingSlot)}
                    className="w-full py-4 bg-[#eb483f] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#eb483f]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Update Configuration
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
