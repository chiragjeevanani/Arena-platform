import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Clock, MapPin, 
  Layers, Video, Users, Search,
  Zap, ShieldCheck, Target, Activity,
  MessageSquare, Mail, Phone, MoreHorizontal
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const BATCHES = [
  { id: 1, name: 'Morning Elite', level: 'Advanced', students: 12, maxStudents: 15, schedule: 'Mon, Wed, Fri', time: '06:00 AM - 08:00 AM', arena: 'Olympic Smash', court: 'Court 1', color: '#CE2029', type: 'Offline' },
  { id: 2, name: 'Junior Stars', level: 'Beginner', students: 8, maxStudents: 20, schedule: 'Tue, Thu, Sat', time: '08:00 AM - 09:30 AM', arena: 'Badminton Hub', court: 'Court 3', color: '#36454F', type: 'Offline' },
  { id: 3, name: 'Pro Analytics', level: 'Intermediate', students: 15, maxStudents: 15, schedule: 'Wed, Sat', time: '01:00 PM - 02:30 PM', arena: 'Online', court: 'Zoom', color: '#6366f1', type: 'Online' },
  { id: 4, name: 'Evening Drill', level: 'Intermediate', students: 10, maxStudents: 18, schedule: 'Mon, Fri', time: '11:00 AM - 01:00 PM', arena: 'Olympic Smash', court: 'Court 2', color: '#f59e0b', type: 'Offline' }
];

const BatchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    
    const MEMBERSHIP_TYPES = [
        { code: 'IA', label: 'Individual Annual', color: '#CE2029' },
        { code: 'IHY', label: 'Individual Half Yearly', color: '#f59e0b' },
        { code: 'GAP', label: 'Group Annual Premium', color: '#3b82f6' },
        { code: 'GANP', label: 'Group Annual Non Premium', color: '#10b981' },
        { code: 'GAW', label: 'Group Annual Weekend', color: '#8b5cf6' },
        { code: 'GHYP', label: 'Group Half Yearly Premium', color: '#ec4899' },
        { code: 'GHYNP', label: 'Group Half yearly Non Premium', color: '#6366f1' },
        { code: 'GHYW', label: 'Group Half yearly Weekend', color: '#f97316' }
    ];

    const batch = BATCHES.find(b => b.id === parseInt(id));
    if (!batch) return <div>Batch not found</div>;

    const occupancy = (batch.students / batch.maxStudents) * 100;

    return (
        <div className={`min-h-screen p-4 md:p-8 pb-32 animate-in fade-in duration-500 bg-transparent ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 group-hover:bg-white/10 text-white/40' : 'bg-white group-hover:bg-[#F8FBFF] text-slate-800 border border-slate-200'}`}>
                        <ChevronLeft size={18} />
                    </div>
                </button>
                <div className="text-right">
                    <h2 className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-500'}`}>Batch Master</h2>
                    <p className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest leading-none mt-1">{batch.name}</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-5">
                {/* Hero Feature Section - Transparent over Pink */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden rounded-2xl border-b pb-8 px-2 ${isDark ? 'border-white/5' : 'border-[#CE2029]/10'}`}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE2029]/[0.05] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
                    
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#CE2029]" />
                                    <span className={`text-[7.5px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/80' : 'text-black'}`}>Live Session Profile</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {batch.name} <span className="text-[#CE2029]">Elite</span>
                                </h1>
                            </div>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 border border-white/5' : 'bg-[#F8FBFF] border border-[#3b82f6]/5 shadow-sm'}`}>
                                {batch.type === 'Online' ? <Video size={20} className="text-blue-500" /> : <Zap size={20} className="text-[#CE2029]" />}
                            </div>
                        </div>

                        {/* Summary Stats Row - Lighter Blue Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                                <p className={`text-[6.5px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/80' : 'text-slate-600'}`}>Rank Level</p>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-[#CE2029]" />
                                    <p className="text-[12px] font-black uppercase tracking-wide">{batch.level}</p>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                                <p className={`text-[6.5px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/80' : 'text-slate-600'}`}>Total Intake</p>
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-[#CE2029]" />
                                    <p className="text-[12px] font-black uppercase tracking-wide">{batch.students} / {batch.maxStudents}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Logistics Hub - Lighter Blue Tiles */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: Calendar, val: batch.schedule, label: 'Schedule', color: '#CE2029' },
                        { icon: Clock, val: batch.time, label: 'Duration', color: '#f59e0b' }
                    ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-[#1a1c1e] border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                <item.icon size={14} />
                            </div>
                            <p className={`text-[7px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white/80' : 'text-black'}`}>{item.label}</p>
                            <p className="text-[11px] font-black uppercase tracking-tight truncate">{item.val}</p>
                        </div>
                    ))}
                </div>

                {/* Sub-Header for Students */}
                <div className="pt-6 flex items-center justify-between">
                    <h2 className="text-base font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Registered <span className="text-[#CE2029]">Students</span></h2>
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-[#F8FBFF] border-[#3b82f6]/10 text-[#3b82f6]'}`}>
                        {batch.students} Members
                    </div>
                </div>

                {/* Student Search - Lighter Blue Theme */}
                <div className={`relative flex items-center px-4 rounded-xl border h-12 transition-all shadow-sm ${
                    isDark ? 'bg-white/[0.03] border-white/5 focus-within:border-[#CE2029]/30' : 'bg-[#F8FBFF] border-[#3b82f6]/5 focus-within:border-[#3b82f6]/50'
                }`}>
                    <Search size={16} className="text-[#3b82f6] mr-3 opacity-60" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for member..." 
                        className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-full h-full placeholder:opacity-50"
                    />
                </div>

                {/* Student Grid - Lighter Blue Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
                    {Array.from({ length: batch.students }).map((_, sidx) => (
                        <motion.div
                            key={sidx}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: sidx * 0.05 }}
                            className={`group relative p-4 rounded-xl border overflow-hidden transition-all duration-300 ${
                                isDark 
                                    ? 'bg-[#1a1c1e] border-white/5 hover:border-[#CE2029]/30' 
                                    : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm hover:border-[#3b82f6]/20'
                            }`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${
                                                isDark ? 'bg-white/5' : 'bg-white/95'
                                            }`}>
                                                <span style={{ color: '#CE2029' }}>{(sidx + 1).toString().padStart(2, '0')}</span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-inherit flex items-center justify-center text-white">
                                                <ShieldCheck size={8} strokeWidth={4} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-xs font-black leading-none uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Alex Johnson</h3>
                                                {(() => {
                                                    const mType = MEMBERSHIP_TYPES[sidx % MEMBERSHIP_TYPES.length];
                                                    return (
                                                        <span 
                                                            className={`text-[6px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded border flex items-center gap-1`}
                                                            style={{ 
                                                                backgroundColor: isDark ? `${mType.color}10` : `${mType.color}05`,
                                                                borderColor: isDark ? `${mType.color}30` : `${mType.color}20`,
                                                                color: mType.color 
                                                            }}
                                                        >
                                                            {mType.code}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <p className={`text-[9px] font-black tracking-wider uppercase mt-1 ${isDark ? 'text-white/80' : 'text-slate-900'}`}>ID: AS{202488 + sidx}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/coach/students/${202488 + sidx}/performance`)}
                                        className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-[#3b82f6]/20 text-slate-600'}`}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                {/* Quick Action Smart-Bar */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { icon: MessageSquare, color: '#CE2029' },
                                        { icon: Phone, color: '#f59e0b' },
                                        { icon: Mail, color: '#3b82f6' }
                                    ].map((action, aidx) => (
                                        <button 
                                            key={aidx} 
                                            className={`h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                                                isDark 
                                                    ? 'bg-white/[0.02] border border-white/5' 
                                                    : 'bg-white border border-slate-100 shadow-sm hover:bg-[#F8FBFF]'
                                            }`}
                                        >
                                            <action.icon size={13} style={{ color: action.color }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BatchDetails;
