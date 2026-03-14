import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';

const EventCard = ({ event, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-[#eb483f] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg">
          {event.date}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {event.category}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h4 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-[#eb483f] transition-colors">
          {event.title}
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <MapPin size={14} className="text-[#eb483f]" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Clock size={14} className="text-[#eb483f]" />
            <span>{event.time}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-50">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entry</span>
            <div className="text-[#eb483f] font-black text-xl font-display">₹{event.price}</div>
          </div>
          <button className="bg-[#eb483f] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#eb483f]/20 hover:scale-105 active:scale-95 transition-all">
            Join Event
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
