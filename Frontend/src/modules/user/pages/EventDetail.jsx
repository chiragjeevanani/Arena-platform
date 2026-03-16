import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, MapPin, Tag, Share2, Heart } from 'lucide-react';
import Event1 from '../../../assets/Events/Events1 .jpeg';
import Event2 from '../../../assets/Events/Events2.jpeg';
import Event3 from '../../../assets/Events/Events3.jpeg';

const eventsData = [
  {
    id: 1,
    title: 'Spring Camp 2025',
    subtitle: 'Badminton Training Camp for Beginners & Advanced',
    image: Event1,
    date: 'March 15 – March 30, 2025',
    time: '8:00 AM – 12:00 PM',
    location: 'AMM Sports Arena, Main Hall',
    price: '35 OMR',
    category: 'Badminton',
    description:
      'Join our Spring Camp for an intensive badminton training experience. Whether you are a beginner or an advanced player, our coaches will work with you to sharpen your skills. The camp covers stroke correction, technical training, tactical training, match practice, fitness & conditioning, and mental training. Sibling discount is available.',
    highlights: [
      'Stroke Correction: Grip, footwork, smash, drop, clear, net shots',
      'Technical Training: Proper techniques for consistency, serve & return skills',
      'Tactical Training: Proven techniques, strategies, positioning & shot selection',
      'Match Practice: Daily games, situation-based rallies, pressure training',
      'Fitness & Conditioning: Agility, speed, strength & flexibility drills',
      'Mental Training: Focus, confidence & sports match-p development',
      'Weekly Progress Review and distribution/feedback',
    ],
    contact: '+968 9178 3155 / +968 7623 6687',
    badge: 'MARCH 15TH – 30TH',
  },
  {
    id: 2,
    title: 'Winter Camp 2024',
    subtitle: 'Exclusive Badminton Training — Intermediate & Beginner',
    image: Event2,
    date: 'Dec 18 – Jan 3 (Sunday to Thursday)',
    time: '8:00 AM – 12:30 PM',
    location: 'AMM Sports Arena, Indoor Courts',
    price: '35–40 OMR',
    category: 'Badminton',
    description:
      'Our Winter Camp offers two exclusive batches tailored to different skill levels. Batch 01 is for intermediate players (8:00 AM – 10:00 AM) at 35 OMR, while Batch 02 is for beginners (10:30 AM – 12:30 PM) at 40 OMR. Separate Beginner & Intermediate batches ensure focused training.',
    highlights: [
      'Batch 01 (Intermediate): 8:00 – 10:00 AM | 35 OMR',
      'Batch 02 (Beginner): 10:30 AM – 12:30 PM | 40 OMR',
      'Stroke Connection: Grip, footwork, smash, drop, clear, net shots',
      'Technical Training: Proper techniques for consistency, service & return skills',
      'Tactical Training: Proven techniques, strategies, positioning & shot selection',
      'Match Practice: Daily games, situation-based rallies, pressure training',
      'Fitness & Conditioning: Agility, speed, strength & flexibility drills',
      'Mental Training: Focus, confidence & sports match preparation',
    ],
    contact: '+968 9178 3155 / +968 9744 6582',
    badge: 'DEC 18TH – JAN 3RD',
  },
  {
    id: 3,
    title: 'New Year Racket Fest — Season 1',
    subtitle: 'Celebrate the New Year with an Epic Badminton Festival',
    image: Event3,
    date: 'January 2025',
    time: 'TBA',
    location: 'AMM Sports Arena',
    price: 'TBA',
    category: 'Badminton',
    description:
      'Welcome the New Year with AMM Sports Arena\'s Racket Fest Season 1! A fun-filled badminton event open to all levels. Stay tuned for match schedules, prizes, and special guest appearances. This is your chance to celebrate the sport you love with the community.',
    highlights: [
      'Open to all skill levels',
      'Exciting prizes and trophies',
      'Fun match formats',
      'Community hangout and networking',
      'Special appearances by top players',
    ],
    contact: 'Contact AMM Sports Arena for details',
    badge: 'SEASON 1',
  },
];

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = eventsData.find((e) => e.id === parseInt(id));

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#eb483f] font-bold text-lg">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Image */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: '420px' }}>
        <img
          src={event.image}
          alt={event.title}
          className="w-full object-cover"
          style={{ maxHeight: '420px', objectPosition: 'top' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-2 left-0 flex items-center justify-center text-white drop-shadow-md active:scale-95 transition-all z-10 p-1"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Share button */}
        <button className="absolute top-2 right-4 flex items-center justify-center text-white drop-shadow-md active:scale-95 transition-all z-10 p-1">
          <Share2 size={24} />
        </button>

        {/* Category badge on image */}
        {/* <div className="absolute bottom-4 left-4 z-10">
          <span className="bg-[#eb483f] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            {event.category}
          </span>
        </div> */}
      </div>

      {/* Content */}
      <div className="px-5 pt-6 space-y-6">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[#eb483f] font-black text-xs uppercase tracking-widest mb-1">{event.badge}</p>
          <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{event.title}</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">{event.subtitle}</p>
        </motion.div>

        {/* Info chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: CalendarDays, label: 'Date', value: event.date },
            { icon: Clock, label: 'Time', value: event.time },
            { icon: MapPin, label: 'Venue', value: event.location },
            { icon: Tag, label: 'Fee', value: event.price },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-2xl px-4 py-3 border border-[#eb483f]/30 shadow-sm flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#eb483f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} className="text-[#eb483f]" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-xs font-bold text-slate-800 leading-snug mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl p-5 border border-[#eb483f]/30 shadow-sm"
        >
          <h2 className="text-sm font-black text-[#eb483f] uppercase tracking-widest mb-3">About This Event</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-[#eb483f]/30 shadow-sm"
        >
          <h2 className="text-sm font-black text-[#eb483f] uppercase tracking-widest mb-4">What's Included</h2>
          <div className="space-y-2.5">
            {event.highlights.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#eb483f] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <span className="text-white text-[9px] font-black">{i + 1}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-[#eb483f] rounded-2xl p-5 shadow-lg"
        >
          <h2 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Contact for Registration</h2>
          <p className="text-white font-bold text-sm leading-relaxed">{event.contact}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;
