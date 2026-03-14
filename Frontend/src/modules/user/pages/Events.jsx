import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import EventCard from '../components/EventCard';
import Card1 from '../../../assets/Cards/Card1.jpg';
import Card2 from '../../../assets/Cards/Card2.jpg';
import Card3 from '../../../assets/Cards/Card3.jpg';
import Card4 from '../../../assets/Cards/Card4.jpg';

const Events = () => {
  const navigate = useNavigate();

  const allEvents = [
    {
      id: 1,
      title: "Monsoon Smash Tournament",
      date: "25 Oct",
      time: "09:00 AM",
      location: "AMM Sports Arena, Noida",
      image: Card1,
      price: "499",
      category: "Badminton"
    },
    {
      id: 2,
      title: "Table Tennis Championship",
      date: "28 Oct",
      time: "11:00 AM",
      location: "Sector 62, Noida",
      image: Card2,
      price: "299",
      category: "Table Tennis"
    },
    {
      id: 3,
      title: "Junior Badminton Cup",
      date: "02 Nov",
      time: "08:00 AM",
      location: "AMM Sports Arena",
      image: Card3,
      price: "199",
      category: "Badminton"
    },
    {
      id: 4,
      title: "Elite Players Workshop",
      date: "10 Nov",
      time: "04:00 PM",
      location: "Main Indoor Hall",
      image: Card4,
      price: "999",
      category: "Training"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-[#eb483f] px-6 pt-6 pb-10 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">Sports Events</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <input
            type="text"
            placeholder="Search tournaments, workshops..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Badminton', 'Table Tennis', 'Training', 'Tournaments'].map((tag) => (
            <button key={tag} className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${tag === 'All'
                ? 'bg-[#eb483f] text-white shadow-lg shadow-[#eb483f]/20'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-[#eb483f]/30'
              }`}>
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
