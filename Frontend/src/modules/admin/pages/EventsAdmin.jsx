import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Plus, Search, Filter, Calendar, Target, Medal, X, 
  Zap, ArrowRight, ShieldCheck, Share2, Users, Activity,
  Settings2, BarChart3, ChevronRight, Hash, Eye, Edit3, MoreHorizontal
} from 'lucide-react';

import { 
  Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Button,
  Typography
} from '@mui/material';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listArenaAdminCmsContent } from '../../../services/arenaAdminApi';
import { listAdminCmsContent, listEventRegistrations, updateEventRegistrationStatus } from '../../../services/adminOpsApi';
import { registerForEvent } from '../../../services/eventsApi';
import { resolveLiveCmsScope } from '../../../utils/liveOpsScope';
import { mapCmsContentToEventCard } from '../../../utils/arenaCmsEventAdapter';

const DEMO_EVENTS = [];

const EventsAdmin = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const arenaIdFromQuery = searchParams.get('arenaId');

  const cmsScope = useMemo(
    () =>
      resolveLiveCmsScope(user, {
        apiConfigured: isApiConfigured(),
        hasToken: Boolean(getAuthToken()),
        arenaIdFromQuery,
      }),
    [user, arenaIdFromQuery]
  );

  const [cmsEvents, setCmsEvents] = useState([]);
  const [view, setView] = useState('GRID'); // GRID, DETAILS
  const [activeEvent, setActiveEvent] = useState(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', age: '', contact: '', category: 'Solo' });
  const [participants, setParticipants] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeAthleteMenu, setActiveAthleteMenu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!cmsScope.live) {
      setCmsEvents([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data =
          cmsScope.channel === 'arena'
            ? await listArenaAdminCmsContent(cmsScope.cmsListParams)
            : await listAdminCmsContent(cmsScope.cmsListParams);
        const rows = (data.contents || []).map(mapCmsContentToEventCard);
        if (!cancelled) setCmsEvents(rows);
      } catch {
        if (!cancelled) setCmsEvents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cmsScope]);

  // --- Registration Logic ---
  useEffect(() => {
    if (view === 'DETAILS' && activeEvent?.id) {
       let cancelled = false;
       (async () => {
         try {
           const data = await listEventRegistrations(activeEvent.id);
           if (!cancelled) {
             setParticipants(data.registrations.map(r => ({
                id: r.id,
                name: r.name,
                contact: r.phone,
                status: r.status,
                category: 'Standard', // Fallback for simple registrations
                age: 'N/A' // Fallback
             })));
           }
         } catch (err) {
           console.error('Failed to load registrations', err);
         }
       })();
       return () => { cancelled = true; };
    }
  }, [view, activeEvent]);

  const displayEvents = cmsScope.live ? cmsEvents : DEMO_EVENTS;

  // --- Registration Logic ---

  const handleManualEnroll = async () => {
    if (!regForm.name || !regForm.contact) {
      alert('Operational Error: Name and Contact are mandatory.');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerForEvent({
        eventId: activeEvent.id,
        name: regForm.name,
        phone: regForm.contact
      });
      setShowRegModal(false);
      setRegForm({ name: '', age: '', contact: '', category: 'Solo' });
      // Refresh list
      const data = await listEventRegistrations(activeEvent.id);
      setParticipants(data.registrations.map(r => ({
         id: r.id,
         name: r.name,
         contact: r.phone,
         status: r.status,
         category: 'Standard',
         age: 'N/A'
      })));
    } catch (err) {
      alert('Enrollment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
    p.contact.includes(filterQuery) ||
    p.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredEvents = displayEvents.filter((e) =>
    e.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const toggleStatus = async (id, newStatus) => {
    try {
      await updateEventRegistrationStatus(id, newStatus);
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert('Failed to update status');
    }
    setActiveAthleteMenu(null);
  };

  return (
    <div className="text-[#36454F] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB] min-h-screen" style={{ fontFamily: '"Outfit", sans-serif' }}>
      
      {view === 'GRID' ? (
        <div className="mx-auto space-y-3 py-3 px-1 md:px-0">
          {/* Header (Hyper-Compact & Classy) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-slate-200/60 bg-white p-4 shadow-sm rounded-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#CE2029] mb-1">
                 <div className="w-3 h-[1.5px] bg-[#CE2029]" />
                 <Activity size={10} /> Tournament Ops
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#36454F] tracking-tight leading-none bg-gradient-to-r from-[#36454F] to-[#243B53] bg-clip-text">Event Management</h2>
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Administrative overview for leagues and championships
              </p>
            </div>
          </div>

          {/* Key Metrics (Classy Miniature Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
             {[
               { label: 'Live Events', value: String(displayEvents.length), icon: Trophy },
               { label: 'Athletes', value: '—', icon: Users },
               { label: 'Approvals', value: '—', icon: ShieldCheck },
               { label: 'Revenue', value: '—', icon: BarChart3 }
             ].map((stat, i) => (
               <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-center justify-between transition-all hover:bg-slate-50">
                  <div>
                     <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-0.5">{stat.label}</p>
                     <p className="text-lg font-bold text-[#36454F]">{stat.value}</p>
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
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#CE2029]" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search across framework..."
                className="w-full h-8 pl-9 pr-3 bg-transparent outline-none text-[10px] font-semibold text-[#36454F] placeholder:text-slate-500 uppercase tracking-[0.1em]"
              />
            </div>
            <div className="h-5 w-px bg-slate-100" />
            <button className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#36454F] transition-colors">
              <Filter size={11} /> Filter
            </button>
          </div>

          {/* Events Data Grid (Extreme-Compact High-Density) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xxl:grid-cols-6 gap-2.5 pb-8">
            {filteredEvents.length === 0 && (
              <p className="col-span-full text-sm text-slate-500 py-8 px-2">
                No events to show. Connect your events API, or restore the bundled demo snapshot from the repo&apos;s demo-backup folder if needed.
              </p>
            )}
            {filteredEvents.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-sm overflow-hidden transition-all group hover:border-[#CE2029] flex flex-col max-w-[300px] cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => { setActiveEvent(item); setView('DETAILS'); setFilterQuery(''); }}
              >
                {/* Event Image */}
                <div className="relative h-24 overflow-hidden bg-slate-100">
                  <img 
                    src={item.banner} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                     <div className="bg-[#CE2029] text-white text-[6.5px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm shadow-sm w-fit">
                        {item.type}
                     </div>
                  </div>
                </div>

                {/* Event Content (Extreme-Compact) */}
                <div className="p-2 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[7.5px] font-bold text-[#CE2029] uppercase tracking-widest">
                      <Hash size={8} strokeWidth={4} />{' '}
                      {item.listCode || String(item.id).slice(-6).toUpperCase()}
                    </div>
                    <div className={`px-1 rounded-sm text-[6.5px] font-bold uppercase tracking-widest border border-slate-100 ${
                        item.status === 'Live' ? 'text-emerald-500' :
                        item.status === 'Drafting' ? 'text-slate-400' :
                        'text-slate-900'
                      }`}>
                        {item.status}
                    </div>
                  </div>

                  <h3 className="text-[10.5px] font-bold text-[#36454F] uppercase tracking-tight group-hover:text-[#CE2029] transition-colors leading-tight line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between mt-0.5">
                     <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                       <Calendar size={8.5} /> {item.date}
                     </p>
                     <div className="flex items-center gap-0.5 text-[8.5px] font-black text-[#36454F]">
                      <Users size={10} className="text-slate-400" /> {item.participants}
                    </div>
                  </div>

                  <div className="mt-auto pt-1.5 border-t border-slate-50 flex items-center gap-1.5">
                     <button className="flex-1 h-6 bg-[#36454F] text-white text-[7.5px] font-black uppercase tracking-[0.1em] rounded-sm hover:bg-black transition-all active:translate-y-0.5">
                        View Details
                     </button>
                     <button className="w-6 h-6 flex items-center justify-center rounded-sm border border-slate-100 text-slate-400 hover:text-[#36454F] hover:bg-slate-50 transition-all">
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
                  onClick={() => { setView('GRID'); setFilterQuery(''); }}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-[#36454F] hover:bg-[#36454F] hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="rotate-180" size={18} />
                </button>
                <div>
                   <Typography variant="overline" sx={{ fontWeight: 800, color: '#CE2029', letterSpacing: 2, display: 'block', lineHeight: 1 }}>{activeEvent?.type || 'Tournament Detail'}</Typography>
                   <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#36454F', mt: 0.5 }}>{activeEvent?.title}</Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                   variant="contained" 
                   startIcon={<UserPlus size={16} />}
                   onClick={() => setShowRegModal(true)}
                   sx={{ bgcolor: '#CE2029', fontWeight: 800, fontSize: '10px', borderRadius: 1, textTransform: 'none', px: 2, '&:hover': { bgcolor: '#000' } }}
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
                             <p className="text-[14px] font-black uppercase tracking-tight text-[#CE2029]">{activeEvent?.prize}</p>
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
                 <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center font-oswald">
                    <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Live Registry</p>
                    <p className="text-4xl font-black text-[#36454F]">{participants.length + (activeEvent?.participants || 0)}</p>
                    <p className="text-[11px] font-bold text-[#CE2029] uppercase mt-2">Allocated Slots: 256</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                       <div className="h-full bg-[#CE2029]" style={{ width: `${((participants.length + (activeEvent?.participants || 0)) / 256) * 100}%` }} />
                    </div>
                 </div>
                 <div className="bg-[#36454F] text-white p-5 rounded-xl shadow-sm flex items-center justify-between font-oswald">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Operational Revenue</p>
                        <p className="text-2xl font-black">{activeEvent?.prize === 'Trophies' ? '0.00' : '480.00'} OMR</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <BarChart3 size={24} className="text-[#CE2029]" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Participant Management Table */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h4 className="text-lg font-black text-[#36454F] uppercase tracking-tight italic font-oswald">Athlete Registry</h4>
                 <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Search athletes..." 
                        className="h-9 pl-9 pr-4 bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#CE2029] rounded-sm w-48 transition-all shadow-sm"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-[#36454F] text-[10px] font-bold uppercase rounded-sm hover:bg-slate-50 transition-all shadow-sm">
                       <ArrowRight size={14} /> Export CSV
                    </button>
                 </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-visible relative">
                 <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="bg-[#F9FAFB] border-b border-slate-200">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200">Athlete Node</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200">Bracket</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200">Category</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic">
                       {filteredParticipants.map((athlete) => (
                          <tr key={athlete.id} className="hover:bg-slate-50 transition-all group">
                             <td className="px-6 py-5">
                                <p className="text-[13px] font-black text-[#36454F] uppercase tracking-tight">{athlete.name}</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{athlete.contact}</p>
                             </td>
                             <td className="px-6 py-5">
                                <p className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{athlete.age} Yrs</p>
                             </td>
                             <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border transition-all ${
                                   athlete.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' :
                                   athlete.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100' :
                                   'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100'
                                }`}>
                                   {athlete.status}
                                </span>
                             </td>
                             <td className="px-6 py-5">
                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{athlete.category}</p>
                             </td>
                             <td className="px-6 py-5 text-right relative">
                                <button 
                                  onClick={() => setActiveAthleteMenu(activeAthleteMenu === athlete.id ? null : athlete.id)}
                                  className={`transition-all p-2 rounded-sm ${activeAthleteMenu === athlete.id ? 'bg-[#36454F] text-white shadow-lg' : 'text-slate-300 hover:text-[#CE2029] hover:bg-slate-100'}`}
                                >
                                   <MoreHorizontal size={18} />
                                </button>
                                
                                <AnimatePresence>
                                  {activeAthleteMenu === athlete.id && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                      className="absolute right-6 top-16 z-[100] w-40 bg-white border border-slate-200 rounded-sm shadow-2xl p-2 flex flex-col gap-1"
                                    >
                                       <button onClick={() => toggleStatus(athlete.id, 'Approved')} className="text-[9px] font-bold uppercase tracking-widest text-left px-3 py-2 rounded-sm hover:bg-green-50 hover:text-green-600 flex items-center gap-2">
                                          <ShieldCheck size={12} /> Approve
                                       </button>
                                       <button onClick={() => toggleStatus(athlete.id, 'Rejected')} className="text-[9px] font-bold uppercase tracking-widest text-left px-3 py-2 rounded-sm hover:bg-red-50 hover:text-red-600 flex items-center gap-2">
                                          <X size={12} /> Reject
                                       </button>

                                    </motion.div>
                                  )}
                                </AnimatePresence>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* Athlete Registration Modal (MUI Style - Readability Focus) */}
      <Dialog 
        open={showRegModal} 
        onClose={() => setShowRegModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' } }}
      >
        <div className="p-8 border-b border-slate-100 bg-[#36454F] text-white flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase italic font-oswald leading-none tracking-tight">Manual Enrollment</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mt-2 italic">Target: {activeEvent?.title}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#CE2029]">
             <UserPlus size={24} />
          </div>
        </div>
        
        <DialogContent sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <TextField 
             label="Athlete Full Nomenclature" 
             variant="outlined" 
             fullWidth 
             required
             value={regForm.name}
             placeholder="Full name as per official ID"
             onChange={(e) => setRegForm({...regForm, name: e.target.value})}
             InputLabelProps={{ sx: { fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#36454F' } }}
             InputProps={{ sx: { borderRadius: 3, bgcolor: '#F9FAFB', fontWeight: 700, '& fieldset': { borderColor: '#E5E7EB' } } }}
           />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField 
                label="Age Bracket" 
                variant="outlined" 
                fullWidth 
                required
                type="number"
                value={regForm.age}
                placeholder="24"
                onChange={(e) => setFilterQuery('') || setRegForm({...regForm, age: e.target.value})}
                InputLabelProps={{ sx: { fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#36454F' } }}
                InputProps={{ sx: { borderRadius: 3, bgcolor: '#F9FAFB', fontWeight: 700, '& fieldset': { borderColor: '#E5E7EB' } } }}
              />
              <FormControl variant="outlined" fullWidth required>
                <InputLabel sx={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#36454F' }}>Participation Tier</InputLabel>
                <Select
                  value={regForm.category}
                  label="Participation Tier"
                  onChange={(e) => setRegForm({...regForm, category: e.target.value})}
                  sx={{ borderRadius: 3, bgcolor: '#F9FAFB', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' } }}
                >
                  <MenuItem value="Solo">Solo Knockout</MenuItem>
                  <MenuItem value="Doubles">Doubles Match</MenuItem>
                  <MenuItem value="Corporate">Corporate Team</MenuItem>
                </Select>
              </FormControl>
           </div>
           
           <TextField 
             label="Operational Contact Link" 
             variant="outlined" 
             fullWidth 
             required
             placeholder="+968 XXXX XXXX"
             value={regForm.contact}
             onChange={(e) => setRegForm({...regForm, contact: e.target.value})}
             InputLabelProps={{ sx: { fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#36454F' } }}
             InputProps={{ sx: { borderRadius: 3, bgcolor: '#F9FAFB', fontWeight: 700, '& fieldset': { borderColor: '#E5E7EB' } } }}
           />
        </DialogContent>

        <DialogActions sx={{ p: 4, px: 5, bgcolor: '#F9FAFB', gap: 2 }}>
           <Button 
             onClick={() => setShowRegModal(false)} 
             sx={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 1.5, color: '#36454F', p: 1.5, px: 3, borderRadius: 2 }}
           >
             Cancel
           </Button>
           <Button 
             variant="contained"
             onClick={handleManualEnroll}
             sx={{ bgcolor: '#CE2029', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 1.5, borderRadius: 3, p: 1.5, px: 4, boxShadow: '0 10px 20px -5px rgba(206,32,41,0.4)', '&:hover': { bgcolor: '#000' } }}
           >
             Commit Enrollment
           </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventsAdmin;
