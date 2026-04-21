import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Users, Search,
    MoreHorizontal, MessageSquare,
    Mail, Phone, ExternalLink,
    ShieldCheck, ArrowUpRight, GraduationCap, Filter
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const BATCHES = [
    { id: 1, name: 'Morning Elite', level: 'Advanced', students: 12, maxStudents: 15, schedule: 'Mon, Wed, Fri', time: '06:00 AM - 08:00 AM', arena: 'Olympic Smash', court: 'Court 1', color: '#CE2029', type: 'Offline' },
    { id: 2, name: 'Junior Stars', level: 'Beginner', students: 8, maxStudents: 20, schedule: 'Tue, Thu, Sat', time: '08:00 AM - 09:30 AM', arena: 'Badminton Hub', court: 'Court 3', color: '#36454F', type: 'Offline' },
    { id: 3, name: 'Pro Analytics', level: 'Intermediate', students: 15, maxStudents: 15, schedule: 'Wed, Sat', time: '01:00 PM - 02:30 PM', arena: 'Online', court: 'Zoom', color: '#6366f1', type: 'Online' },
    { id: 4, name: 'Evening Drill', level: 'Intermediate', students: 10, maxStudents: 18, schedule: 'Mon, Fri', time: '11:00 AM - 01:00 PM', arena: 'Olympic Smash', court: 'Court 2', color: '#f59e0b', type: 'Offline' }
];

const BatchStudents = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const batch = BATCHES.find(b => b.id === parseInt(id));

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

    if (!batch) return <div>Batch not found</div>;

    const CONTAINER_VARIANTS = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const CARD_VARIANTS = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <div className={`min-h-screen p-4 md:p-8 pb-32 bg-transparent ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {/* Glossy Header Section */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <button onClick={() => navigate(-1)} className="group relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-white border-slate-200 group-hover:bg-slate-50 shadow-sm border'
                        }`}>
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                </button>
                <div className="text-right">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 mb-0.5">Membership List</h2>
                    <p className="text-[9px] font-bold text-[#CE2029] uppercase tracking-wider">{batch.name} · {batch.students} Members</p>
                </div>
            </div>
            <div className="mb-6">
                <h1 className="text-xl font-black tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Registered <span className="text-[#CE2029]">Students</span></h1>
            </div>

            {/* Premium Stats Row */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                <div className={`p-3 rounded-xl border min-w-[120px] ${isDark ? 'bg-[#CE2029]/10 border-[#CE2029]/20' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Enrollment</p>
                    <p className="text-xl font-black leading-none">{batch.students}</p>
                </div>
                <div className={`p-3 rounded-xl border min-w-[120px] ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Active</p>
                    <p className="text-xl font-black leading-none">{Math.floor(batch.students * 0.9)}</p>
                </div>
                <div className={`p-3 rounded-xl border min-w-[120px] ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Level</p>
                    <p className="text-[10px] font-black leading-none uppercase">{batch.level}</p>
                </div>
            </div>

            {/* Premium Search Hub - Filter Removed */}
            <div className={`relative flex items-center px-4 mb-6 rounded-xl border h-11 transition-all group ${isDark ? 'bg-white/[0.04] border-white/5 focus-within:border-[#CE2029]/30' : 'bg-[#F8FBFF] border-[#3b82f6]/5 focus-within:border-[#3b82f6]/50 shadow-sm'
                }`}>
                <Search size={16} className="text-[#3b82f6] mr-3 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                    type="text"
                    placeholder="Search member..."
                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full h-full placeholder:opacity-20"
                />
            </div>

            {/* Interactive Member Grid */}
            <motion.div
                variants={CONTAINER_VARIANTS}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3"
            >
                {Array.from({ length: batch.students }).map((_, sidx) => (
                    <motion.div
                        key={sidx}
                        variants={CARD_VARIANTS}
                        whileHover={{ y: -2 }}
                        className={`group relative p-3.5 rounded-xl border overflow-hidden transition-all duration-300 ${isDark
                                ? 'bg-[#1a1c1e] border-white/5 hover:border-[#CE2029]/30'
                                : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm hover:border-[#3b82f6]/20'
                            }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${isDark ? 'bg-white/5' : 'bg-white/95'
                                            }`}>
                                            <span style={{ color: '#CE2029' }}>{(sidx + 1).toString().padStart(2, '0')}</span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-inherit flex items-center justify-center text-white">
                                            <ShieldCheck size={7} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-xs font-black leading-none uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Alex Johnson</h3>
                                        </div>
                                        <p className="text-[8px] font-black opacity-50 tracking-wider uppercase mt-0.5">ID: AS{202488 + sidx}</p>
                                        <div className="mt-1.5 flex items-center gap-1">
                                            {(() => {
                                                const mType = MEMBERSHIP_TYPES[sidx % MEMBERSHIP_TYPES.length];
                                                return (
                                                    <span
                                                        className={`text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border flex items-center gap-1`}
                                                        style={{
                                                            backgroundColor: isDark ? `${mType.color}10` : `${mType.color}05`,
                                                            borderColor: isDark ? `${mType.color}30` : `${mType.color}20`,
                                                            color: mType.color
                                                        }}
                                                    >
                                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: mType.color }} />
                                                        {mType.code}
                                                    </span>
                                                );
                                            })()}
                                            <span className={`text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${isDark ? 'border-white/20 text-white/50' : 'border-slate-200 text-slate-500'}`}>94% AT</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/coach/students/${202488 + sidx}/performance`)}
                                    className={`p-1 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-white/20' : 'hover:bg-slate-100 text-slate-300'}`}
                                >
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>

                            {/* Action Smart-Bar */}
                            <div className="grid grid-cols-3 gap-1">
                                {(() => {
                                    const studentPhone = `+9198765${(10000 + sidx).toString().slice(-5)}`;
                                    const studentEmail = `student${202488 + sidx}@arena.com`;
                                    
                                    return [
                                        { icon: MessageSquare, color: '#CE2029', href: `sms:${studentPhone}` },
                                        { icon: Phone, color: '#f59e0b', href: `tel:${studentPhone}` },
                                        { icon: Mail, color: '#3b82f6', href: `mailto:${studentEmail}` }
                                    ].map((action, aidx) => (
                                        <a
                                            key={aidx}
                                            href={action.href}
                                            className={`group/btn h-7 rounded-md flex items-center justify-center transition-all active:scale-95 ${isDark
                                                    ? 'bg-white/[0.01] border border-white/5 hover:bg-white/[0.04]'
                                                    : 'bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 shadow-sm'
                                                }`}
                                        >
                                            <action.icon size={11} style={{ color: action.color }} />
                                        </a>
                                    ));
                                })()}
                            </div>
                        </div>
                    </motion.div>

                ))}
            </motion.div>
        </div>
    );
};

export default BatchStudents;
