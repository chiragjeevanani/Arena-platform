import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Plus, Search, Filter, Calendar, Target, Medal, X, 
  Zap, ArrowRight, ShieldCheck, Share2, Users, Activity,
  Settings2, BarChart3, ChevronRight, Hash, Eye, Edit3, MoreHorizontal
} from 'lucide-react';

const EVENTS = [
  { 
    id: 1, 
    title: 'Summer Smash 2026', 
    type: 'Open Tournament', 
    date: 'Mar 25-27', 
    venue: 'Olympic Arena', 
    status: 'Registration', 
    prize: '500 OMR', 
    participants: 128,
    banner: 'https://images.unsplash.com/photo-1626225967045-944062402170?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 2, 
    title: 'Junior Championship', 
    type: 'U-17 Boys/Girls', 
    date: 'Apr 05', 
    venue: 'Olympic Arena', 
    status: 'Drafting', 
    prize: 'Trophies', 
    participants: 0,
    banner: 'https://images.unsplash.com/photo-1542103448-43d96924d548?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 3, 
    title: 'Corporate League', 
    type: 'Teams of 4', 
    date: 'Ongoing', 
    venue: 'Delta Hub', 
    status: 'Live', 
    prize: 'Shield', 
    participants: 16,
    banner: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 4, 
    title: 'Weekend Blitz', 
    type: 'Solo Knockout', 
    date: 'Apr 12', 
    venue: 'Olympic Arena', 
    status: 'Upcoming', 
    prize: '120 OMR', 
    participants: 64,
    banner: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop'
  },
];

import { 
  Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Button,
  Typography
} from '@mui/material';
import { UserPlus } from 'lucide-react';

const EventsAdmin = () => {
  const [view, setView] = useState('GRID'); // GRID, DETAILS
  const [activeEvent, setActiveEvent] = useState(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', age: '', contact: '', category: 'Solo' });

  // Mock Participants for the Details View
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Ali Al-Said', age: 24, contact: '+968 9876 5432', category: 'Men\'s Solo', status: 'Approved' },
    { id: 2, name: 'Fatima Al-Harthy', age: 19, contact: '+968 9123 4567', category: 'Women\'s Solo', status: 'Pending' },
    { id: 3, name: 'Salim Al-Abri', age: 28, contact: '+968 9988 7766', category: 'Men\'s Solo', status: 'Rejected' },
  ]);

  const handleManualEnroll = () => {
    if (!regForm.name) return;
    const newParticipant = {
      id: Date.now(),
      name: regForm.name,
      age: regForm.age,
      contact: regForm.contact,
      category: regForm.category,
      status: 'Approved'
    };
    setParticipants([newParticipant, ...participants]);
    setShowRegModal(false);
    setRegForm({ name: '', age: '', contact: '', category: 'Solo' });
    alert('Athlete Registered Successfully for ' + activeEvent?.title);
  };

  return (
    <div className="text-[#1a2b3c] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB] min-h-screen" style={{ fontFamily: '"Outfit", sans-serif' }}>
      
      {view === 'GRID' ? (
        <div className="mx-auto space-y-3 py-3 px-1 md:px-0">
          {/* Header (Hyper-Compact & Classy) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-slate-200/60 bg-white p-4 shadow-sm rounded-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#eb483f] mb-1">
                 <div className="w-3 h-[1.5px] bg-[#eb483f]" />
                 <Activity size={10} /> Tournament Ops
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#0A1121] tracking-tight leading-none bg-gradient-to-r from-[#0A1121] to-[#243B53] bg-clip-text">Event Management</h2>
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Administrative overview for leagues and championships
              </p>
            </div>
            <button 
              onClick={() => setShowNewEventModal(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#0A1121] text-white hover:bg-black transition-all text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/5 active:translate-y-0.5"
            >
              <Plus size={12} strokeWidth={3} /> Draft New Event
            </button>
          </div>

          {/* Key Metrics (Classy Miniature Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
             {[
               { label: 'Live Events', value: '03', icon: Trophy },
               { label: 'Athletes', value: '3.4K+', icon: Users },
               { label: 'Approvals', value: '12', icon: ShieldCheck },
               { label: 'Revenue', value: '1.2L', icon: BarChart3 }
             ].map((stat, i) => (
               <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-center justify-between transition-all hover:bg-slate-50">
                  <div>
                     <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-0.5">{stat.label}</p>
                     <p className="text-lg font-bold text-[#0A1121]">{stat.value}</p>
                  </div>
                  <div className="w-7 h-7 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                     <stat.icon size={12} strokeWidth={2.5} />
                  </div>
               </div>
             ))}
          </div>

          {/* Toolbar (Sharp Compact) */}
          <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-sm">
            <div className="flex-1 relative group">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#eb483f]" />
              <input
                type="text"
                placeholder="Search across framework..."
                className="w-full h-8 pl-9 pr-3 bg-transparent outline-none text-[10px] font-semibold text-[#0A1121] placeholder:text-slate-500 uppercase tracking-[0.1em]"
              />
            </div>
            <div className="h-5 w-px bg-slate-100" />
            <button className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0A1121] transition-colors">
              <Filter size={11} /> Filter
            </button>
          </div>

          {/* Events Data Grid (Extreme-Compact High-Density) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xxl:grid-cols-6 gap-2.5 pb-8">
            {EVENTS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-sm overflow-hidden transition-all group hover:border-[#eb483f] flex flex-col max-w-[300px] cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => { setActiveEvent(item); setView('DETAILS'); }}
              >
                {/* Event Image */}
                <div className="relative h-24 overflow-hidden bg-slate-100">
                  <img 
                    src={item.banner} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                     <div className="bg-[#eb483f] text-white text-[6.5px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm shadow-sm w-fit">
                        {item.type}
                     </div>
                  </div>
                </div>

                {/* Event Content (Extreme-Compact) */}
                <div className="p-2 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[7.5px] font-bold text-[#eb483f] uppercase tracking-widest">
                      <Hash size={8} strokeWidth={4} /> {item.id.toString().padStart(4, '0')}
                    </div>
                    <div className={`px-1 rounded-sm text-[6.5px] font-bold uppercase tracking-widest border border-slate-100 ${
                        item.status === 'Live' ? 'text-emerald-500' :
                        item.status === 'Drafting' ? 'text-slate-400' :
                        'text-slate-900'
                      }`}>
                        {item.status}
                    </div>
                  </div>

                  <h3 className="text-[10.5px] font-bold text-[#0A1121] uppercase tracking-tight group-hover:text-[#eb483f] transition-colors leading-tight line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between mt-0.5">
                     <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                       <Calendar size={8.5} /> {item.date}
                     </p>
                     <div className="flex items-center gap-0.5 text-[8.5px] font-black text-[#0A1121]">
                      <Users size={10} className="text-slate-400" /> {item.participants}
                    </div>
                  </div>

                  <div className="mt-auto pt-1.5 border-t border-slate-50 flex items-center gap-1.5">
                     <button className="flex-1 h-6 bg-[#0A1121] text-white text-[7.5px] font-black uppercase tracking-[0.1em] rounded-sm hover:bg-black transition-all active:translate-y-0.5">
                        View Details
                     </button>
                     <button className="w-6 h-6 flex items-center justify-center rounded-sm border border-slate-100 text-slate-400 hover:text-[#0A1121] hover:bg-slate-50 transition-all">
                        <Settings2 size={11} />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-6 space-y-6">
           {/* Details View Header */}
           <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('GRID')}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-[#0A1121] hover:bg-[#0A1121] hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="rotate-180" size={18} />
                </button>
                <div>
                   <Typography variant="overline" sx={{ fontWeight: 800, color: '#eb483f', letterSpacing: 2, display: 'block', lineHeight: 1 }}>{activeEvent?.type || 'Tournament Detail'}</Typography>
                   <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#0A1121', mt: 0.5 }}>{activeEvent?.title}</Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                   variant="contained" 
                   startIcon={<UserPlus size={16} />}
                   onClick={() => setShowRegModal(true)}
                   sx={{ bgcolor: '#eb483f', fontWeight: 800, fontSize: '10px', borderRadius: 1, textTransform: 'none', px: 2 }}
                 >
                   Manual Registration
                 </Button>
              </div>
           </div>

           {/* Event Overview Hero */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                 <div className="relative h-64 rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                    <img src={activeEvent?.banner} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                       <div className="grid grid-cols-3 gap-12 text-white">
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Status</p>
                             <p className="text-[14px] font-black uppercase tracking-tight">{activeEvent?.status}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Prize Pool</p>
                             <p className="text-[14px] font-black uppercase tracking-tight text-[#eb483f]">{activeEvent?.prize}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Arena Node</p>
                             <p className="text-[14px] font-black uppercase tracking-tight">{activeEvent?.venue}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center">
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Live Registry</p>
                    <p className="text-4xl font-black text-[#0A1121]">{participants.length + (activeEvent?.participants || 0)}</p>
                    <p className="text-[11px] font-bold text-[#eb483f] uppercase mt-2">Allocated Slots: 256</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                       <div className="h-full bg-[#eb483f]" style={{ width: `${((participants.length + (activeEvent?.participants || 0)) / 256) * 100}%` }} />
                    </div>
                 </div>
                 <div className="bg-[#0A1121] text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Operational Revenue</p>
                        <p className="text-2xl font-black">{activeEvent?.prize === 'Trophies' ? '0.00' : '480.00'} OMR</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <BarChart3 size={24} className="text-[#eb483f]" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Participant Management Table */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h4 className="text-lg font-black text-[#0A1121] uppercase tracking-tight">Athlete Registry</h4>
                 <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-[#0A1121] text-[10px] font-bold uppercase rounded-sm hover:bg-slate-50 transition-all">
                       <Filter size={14} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-[#0A1121] text-[10px] font-bold uppercase rounded-sm hover:bg-slate-50 transition-all">
                       <ArrowRight size={14} /> Export CSV
                    </button>
                 </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-[#F9FAFB] border-b border-slate-200">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Athlete Node</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bracket</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {participants.map((athlete) => (
                          <tr key={athlete.id} className="hover:bg-slate-50 transition-all">
                             <td className="px-6 py-4">
                                <p className="text-[13px] font-bold text-[#0A1121]">{athlete.name}</p>
                                <p className="text-[11px] font-medium text-slate-500 uppercase">{athlete.contact}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{athlete.age} Yrs</p>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   athlete.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                   athlete.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                   'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                   {athlete.status}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{athlete.category}</p>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-[#eb483f] transition-all p-1">
                                   <MoreHorizontal size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* New Event Modal (Sharp & Classy) */}
      <AnimatePresence>
        {showNewEventModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewEventModal(false)} className="absolute inset-0 bg-[#0A1121]/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-sm rounded-sm border border-white/5 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#0A1121]">
                <div>
                  <h3 className="text-lg font-bold tracking-tight uppercase leading-none">Draft Framework</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-2">Internal Operation Descriptor</p>
                </div>
                <button onClick={() => setShowNewEventModal(false)} className="bg-slate-50 p-2 rounded-sm text-slate-500 hover:text-[#0A1121] transition-colors border border-slate-200"><X size={14} /></button>
              </div>

              <div className="p-6 space-y-5 bg-[#F9FAFB]/30">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-0.5">Title Descriptor</label>
                  <input type="text" placeholder="Designate nomenclature..." className="w-full h-8 px-3 rounded-sm border border-slate-200 bg-white text-[10px] font-bold outline-none focus:border-slate-500 uppercase tracking-widest" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-0.5">Allocation (OMR)</label>
                    <input type="text" placeholder="50,000" className="w-full h-8 px-3 rounded-sm border border-slate-200 bg-white text-[10px] font-bold outline-none focus:border-slate-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-0.5">Locus Node</label>
                    <select className="w-full h-8 px-2 rounded-sm border border-slate-200 bg-white text-[10px] font-bold outline-none appearance-none cursor-pointer uppercase tracking-widest pr-4">
                      <option>Olympic Arena</option>
                      <option>Delta Hub</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 bg-white flex items-center gap-3 rounded-sm shadow-sm group">
                   <div className="w-7 h-7 rounded-sm bg-[#eb483f]/5 flex items-center justify-center text-[#eb483f]">
                      <Zap size={14} fill="currentColor" />
                   </div>
                   <p className="text-[8.5px] font-bold text-slate-600 leading-snug">
                     <span className="text-[#0A1121] font-black block mb-0.5 uppercase tracking-widest">Public Deployment</span>
                     Instantly propagate framework to client applications.
                   </p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setShowNewEventModal(false)}
                    className="w-full h-10 rounded-sm bg-[#0A1121] text-white text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Deploy Operation <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Athlete Registration Modal (MUI Style) */}
      <Dialog 
        open={showRegModal} 
        onClose={() => setShowRegModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1.5, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Outfit", sans-serif', 
          fontWeight: 800, 
          fontSize: '14px', 
          textTransform: 'uppercase', 
          bgcolor: '#0A1121', 
          color: 'white',
          p: 2
        }}>
          Athlete Manual Enrollment
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 mt-1">Target: {activeEvent?.title}</p>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
           <TextField 
             label="Athlete Full Nomenclature" 
             variant="standard" 
             fullWidth 
             value={regForm.name}
             onChange={(e) => setRegForm({...regForm, name: e.target.value})}
             InputLabelProps={{ sx: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' } }}
             inputProps={{ style: { fontSize: '12px', fontWeight: 600, fontFamily: '"Outfit", sans-serif' } }}
           />
           <div className="grid grid-cols-2 gap-4">
              <TextField 
                label="Age Bracket" 
                variant="standard" 
                fullWidth 
                type="number"
                value={regForm.age}
                onChange={(e) => setRegForm({...regForm, age: e.target.value})}
                InputLabelProps={{ sx: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' } }}
                inputProps={{ style: { fontSize: '12px', fontWeight: 600, fontFamily: '"Outfit", sans-serif' } }}
              />
              <FormControl variant="standard" fullWidth>
                <InputLabel sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Participation Tier</InputLabel>
                <Select
                  value={regForm.category}
                  onChange={(e) => setRegForm({...regForm, category: e.target.value})}
                  sx={{ fontSize: '12px', fontWeight: 600, fontFamily: '"Outfit", sans-serif' }}
                >
                  <MenuItem value="Solo">Solo Knockout</MenuItem>
                  <MenuItem value="Doubles">Doubles Match</MenuItem>
                  <MenuItem value="Corporate">Corporate Team</MenuItem>
                </Select>
              </FormControl>
           </div>
           <TextField 
             label="Operational Contact Link" 
             variant="standard" 
             fullWidth 
             placeholder="+91 XXX XXX XXXX"
             value={regForm.contact}
             onChange={(e) => setRegForm({...regForm, contact: e.target.value})}
             InputLabelProps={{ sx: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' } }}
             inputProps={{ style: { fontSize: '12px', fontWeight: 600, fontFamily: '"Outfit", sans-serif' } }}
           />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F9FAFB' }}>
           <Button onClick={() => setShowRegModal(false)} sx={{ fontWeight: 800, fontSize: '10px', color: 'slate.500' }}>Cancel</Button>
           <Button 
             variant="contained"
             onClick={handleManualEnroll}
             sx={{ bgcolor: '#eb483f', fontWeight: 800, fontSize: '10px', borderRadius: 1 }}
           >
             Commit Enrollment
           </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventsAdmin;
