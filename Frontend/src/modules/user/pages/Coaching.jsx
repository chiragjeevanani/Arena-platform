import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Verified, Star, Groups, AccessTime, CalendarToday, WhatsApp, Phone } from '@mui/icons-material';
import { COACHING_BATCHES } from '../../../data/mockData';
import { motion } from 'framer-motion';

const Coaching = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-50 shadow-sm border-b border-slate-50">
        <div className="flex items-center space-x-4 mb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <ArrowBack className="text-slate-900" sx={{ fontSize: 20 }} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Coaching Classes</h1>
        </div>
        <p className="text-slate-400 text-xs font-medium pl-14">Learn from professional coaches</p>
      </div>

      <div className="px-6 py-8 space-y-8">
        {COACHING_BATCHES.map((batch, index) => (
          <motion.div 
            key={batch.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-slate-200 border border-slate-100 group"
          >
            <div className="relative h-56 overflow-hidden">
               <img src={batch.image} alt={batch.coachName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-lg">
                  <Verified className="text-[#03396C]" sx={{ fontSize: 18 }} />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Professional</span>
               </div>
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-2xl font-bold">{batch.coachName}</h3>
                  <div className="flex items-center text-white/70 text-sm mt-1">
                     <Star sx={{ fontSize: 16, color: '#fbbf24', mr: 0.5 }} />
                     <span>4.9 (120 Ratings)</span>
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                     <AccessTime className="text-[#03396C]" sx={{ fontSize: 18 }} />
                     <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Timing</p>
                     <p className="text-xs font-bold text-slate-900 mt-1">{batch.timing.split(' - ')[0]}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                     <CalendarToday className="text-[#03396C]" sx={{ fontSize: 18 }} />
                     <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Level</p>
                     <p className="text-xs font-bold text-slate-900 mt-1">{batch.level}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Personalized coaching focused on footwork, racket handling, and strategy. {batch.days} classes per week.
                  </p>
                  <div className="flex items-center space-x-2">
                     <Groups className="text-slate-200" />
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">12 Students max per batch</span>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Fee / Month</p>
                    <p className="text-2xl font-black text-slate-900">₹{batch.fees}</p>
                  </div>
                  <div className="flex space-x-2">
                     <button className="w-12 h-12 rounded-2xl border-2 border-slate-50 text-[#03396C] flex items-center justify-center shadow-sm">
                        <WhatsApp />
                     </button>
                     <button className="bg-[#03396C] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all">
                        Join Class
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Coaching;
