import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Trophy, Save, 
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_METRICS = [
    { category: 'Foundations', metrics: [
        { id: 'grip', name: 'Grip', score: 8 },
        { id: 'footwork_f', name: 'Footwork (Front)', score: 7 },
        { id: 'footwork_b', name: 'Footwork (Back)', score: 6 },
    ]},
    { category: 'Service', metrics: [
        { id: 'serve_b', name: 'Serve (Back)', score: 9 },
        { id: 'serve_f', name: 'Serve (Front)', score: 8 },
    ]},
    { category: 'Forehand', metrics: [
        { id: 'f_toss', name: 'Forehand Toss', score: 7 },
        { id: 'f_smash', name: 'Forehand Smash', score: 5 },
        { id: 'f_drop', name: 'Forehand Drop', score: 9 },
        { id: 'f_dribble', name: 'Forehand Dribble', score: 6 },
    ]},
    { category: 'Backhand', metrics: [
        { id: 'b_drive', name: 'Backhand Drive', score: 4 },
        { id: 'b_smash', name: 'Backhand Smash', score: 3 },
        { id: 'b_drop', name: 'Backhand Drop', score: 7 },
        { id: 'b_dribble', name: 'Backhand Dribble', score: 8 },
    ]},
    { category: 'Physical & Mental', metrics: [
        { id: 'leg_s', name: 'Leg Strength', score: 9 },
        { id: 'arm_s', name: 'Arm Strength', score: 8 },
        { id: 'speed', name: 'Movement Speed', score: 7 },
        { id: 'strategy', name: 'Game Strategy', score: 6 },
        { id: 'mental', name: 'Mental Strength', score: 8 },
    ]},
    { category: 'Consistency', metrics: [
        { id: 'attendance', name: 'Attendance', score: 10 },
    ]}
];

const StudentPerformance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    
    // Flatten metrics into a single state object for easy editing
    const [scores, setScores] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const initialScores = {};
        INITIAL_METRICS.forEach(group => {
            group.metrics.forEach(m => {
                initialScores[m.id] = m.score;
            });
        });
        setScores(initialScores);
    }, []);

    const handleScoreChange = (id, newScore) => {
        setScores(prev => ({
            ...prev,
            [id]: parseInt(newScore)
        }));
    };

    const calculateGlobalScore = () => {
        const values = Object.values(scores);
        if (values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(1);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 1200);
    };

    return (
        <div className={`min-h-screen p-4 md:p-8 pb-32 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="group">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isDark ? 'bg-white/5 group-hover:bg-white/10 text-white/40' : 'bg-white group-hover:bg-slate-50 text-slate-400 shadow-sm border border-slate-200'
                    }`}>
                        <ChevronLeft size={18} />
                    </div>
                </button>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${
                            isSaving ? 'opacity-50 cursor-not-allowed' : 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                        }`}
                    >
                        {isSaving ? 'Processing...' : (
                            <><Save size={12} /> Save Matrix</>
                        )}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <h1 className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Alex <span className="text-[#CE2029]">Johnson</span></h1>
            </div>

            {/* Global Summary Badge - Relocated to Top */}
            <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between overflow-hidden relative ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-sm'
            }`}>
                <div className="relative z-10">
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-70">Live Weighted Average</p>
                    <p className="text-2xl font-black mt-1 leading-none text-[#CE2029]">{calculateGlobalScore()}</p>
                </div>
                <Trophy size={40} className="absolute -right-2 -bottom-2 opacity-[0.05] -rotate-12" />
                <div className="flex flex-col items-end relative z-10">
                    <div className="px-2 py-0.5 rounded-full bg-[#CE2029]/10 text-[#CE2029] text-[7px] font-black uppercase tracking-widest border border-[#CE2029]/30">Assessment Active</div>
                </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-6">
                {INITIAL_METRICS.map((group, gidx) => (
                    <motion.div 
                        key={group.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gidx * 0.05 }}
                    >
                        <h3 className="text-[8px] font-black uppercase tracking-[0.25em] text-[#CE2029] mb-3 ml-1">{group.category}</h3>
                        <div className="grid grid-cols-1 gap-1.5">
                            {group.metrics.map((m) => (
                                <div 
                                    key={m.id}
                                    className={`p-3 rounded-lg border flex items-center justify-between group transition-all ${
                                        isDark ? 'bg-[#1a1c1e] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                                    }`}
                                >
                                    <div className="flex-1 mr-4">
                                        <p className="text-[9px] font-black uppercase tracking-tight opacity-70 leading-none">{m.name}</p>
                                        <div className="flex gap-0.5 mt-2 h-1 overflow-hidden">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`flex-1 rounded-full transition-all duration-700 ${
                                                        i < (scores[m.id] || 0)
                                                            ? 'bg-[#CE2029]' 
                                                            : isDark ? 'bg-white/5' : 'bg-slate-50'
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Score Display & Selector */}
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-xs font-black tracking-tighter text-[#CE2029]">{scores[m.id] || 0}</span>
                                            <span className={`text-[7px] font-black ml-0.5 ${isDark ? 'text-white/80' : 'text-slate-800'}`}>/10</span>
                                        </div>
                                        <div className="relative">
                                            <select 
                                                value={scores[m.id] || 0}
                                                onChange={(e) => handleScoreChange(m.id, e.target.value)}
                                                className={`appearance-none bg-transparent outline-none text-[9px] font-black px-2.5 py-1.5 border rounded-lg min-w-[50px] text-center cursor-pointer transition-all ${
                                                    isDark ? 'border-white/40 hover:bg-white/10 text-white/90' : 'border-slate-400 hover:bg-slate-50 text-slate-900'
                                                }`}
                                            >
                                                {Array.from({ length: 11 }).map((_, i) => (
                                                    <option key={i} value={i} className={isDark ? 'bg-[#0f1115] text-white' : 'bg-white text-slate-900'}>{i}.0</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Success Toast */}
            {showToast && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center gap-3 whitespace-nowrap"
                >
                    <CheckCircle2 size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Performance Updated Successfully</span>
                </motion.div>
            )}
        </div>
    );
};

export default StudentPerformance;
