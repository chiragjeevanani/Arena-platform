import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className="group relative aspect-[4/5] bg-[#0F172A] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
    >
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
      />
      {/* Subtle 'View Details' overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="text-white font-bold tracking-widest uppercase text-sm border border-white/30 px-6 py-2 rounded-full backdrop-blur-sm">View Details</span>
      </div>
    </motion.div>
  );
};

export default EventCard;
