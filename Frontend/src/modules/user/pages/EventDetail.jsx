import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, MapPin, Tag, Share2, Heart, User, Phone, CheckCircle2, X, ChevronRight } from 'lucide-react';
import Event1 from '../../../assets/Events/Events1 .jpeg';
import Event2 from '../../../assets/Events/Events2.jpeg';
import Event3 from '../../../assets/Events/Events3.jpeg';
import BadmintonBanner from '../../../assets/Events/Badminton1.jpg';
import TableTennisBanner from '../../../assets/Events/Tabletennis1.jpg';

const eventsData = [
  {
    id: 1,
    title: 'Pro Badminton Coaching',
    subtitle: 'Intensive Training & League Prep',
    image: BadmintonBanner,
    date: 'Ongoing Registrations',
    time: '4:00 PM – 9:00 PM',
    location: 'AMM Sports Arena, Main Courts',
    price: '45 OMR / Month',
    category: 'Badminton',
    description:
      'Step up your game with our professional Badminton Coaching program. Ideal for passionate athletes looking to improve their agility, power, and precise shot-making. Our expert coaches guide you through personalized drills and strategic formations.',
    highlights: [
      'Advanced footwork and court coverage techniques',
      'Smash power and defensive clear drills',
      'One-on-one personalized coaching feedback',
      'Weekly automated match-ups with peer groups',
      'Complete fitness assessment and diet plan',
    ],
    contact: '+968 9178 3155',
    badge: 'BADMINTON PRO',
  },
  {
    id: 2,
    title: 'Table Tennis Championship',
    subtitle: 'Competitive Leagues & Open Play',
    image: TableTennisBanner,
    date: 'Weekends (Fri - Sat)',
    time: '10:00 AM – 6:00 PM',
    location: 'AMM Sports Arena, TT Hall',
    price: '20 OMR / Entry',
    category: 'Table Tennis',
    description:
      'Join our high-paced Table Tennis Championship series. Compete against top local talent across multiple brackets. Whether you play penhold or shakehand, aggressive looping or careful chopping, test your skills in our professionally timed and reffed environment.',
    highlights: [
      'Professionally formatted double-elimination brackets',
      'Cash prizes and medals for top 3 finishers',
      'State-of-the-art ITTF approved tables',
      'Live broadcasting on local screens',
      'Post-tournament networking and casual play',
    ],
    contact: '+968 7623 6687',
    badge: 'CHAMPIONSHIP',
  },
  {
    id: 3,
    title: 'Spring Camp 2025',
    subtitle: 'Badminton Training Camp for Beginners & Advanced',
    image: Event1,
    date: 'March 15 – March 30, 2025',
    time: '8:00 AM – 12:00 PM',
    location: 'AMM Sports Arena, Main Hall',
    price: '35 OMR',
    category: 'General',
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
    id: 4,
    title: 'Winter Camp 2024',
    subtitle: 'Exclusive Badminton Training — Intermediate & Beginner',
    image: Event2,
    date: 'Dec 18 – Jan 3 (Sunday to Thursday)',
    time: '8:00 AM – 12:30 PM',
    location: 'AMM Sports Arena, Indoor Courts',
    price: '35–40 OMR',
    category: 'General',
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
    id: 5,
    title: 'New Year Racket Fest — Season 1',
    subtitle: 'Celebrate the New Year with an Epic Badminton Festival',
    image: Event3,
    date: 'January 2025',
    time: 'TBA',
    location: 'AMM Sports Arena',
    price: 'TBA',
    category: 'General',
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
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState('form'); // form, payment, success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '' });

  const event = eventsData.find((e) => e.id === parseInt(id));
  const isFree = event?.price?.toLowerCase().includes('free');
  const isTBA = event?.price?.toLowerCase().includes('tba');

  const handleRegister = (e) => {
    e.preventDefault();
    if (regForm.phone.length !== 10) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate processing
    setTimeout(() => {
      setIsSubmitting(false);
      if (isFree || isTBA) {
        setRegStep('success');
      } else {
        // Parse price to number (simple extraction)
        const amount = parseFloat(event.price.replace(/[^0-9.]/g, '')) || 0;
        navigate('/payment', { 
            state: { 
                amount, 
                eventTitle: event.title, 
                eventCategory: event.category,
                date: event.date,
                slot: { time: event.time },
                type: 'event'
            } 
        });
      }
    }, 1200);
  };

  const confirmPayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRegStep('success');
    }, 1500);
  };

  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setRegForm({ ...regForm, name: val });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setRegForm({ ...regForm, phone: val });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#CE2029] font-bold text-lg">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 relative selection:bg-[#CE2029]/10">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Sticky Header */}
        <div className="hidden lg:flex items-center justify-between px-6 py-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-800 font-black uppercase tracking-[0.2em] text-[10px] hover:text-[#CE2029] transition-all group">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#CE2029]/10 transition-colors">
                <ArrowLeft size={16} /> 
              </div>
              Back to Events
           </button>
           <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#CE2029] transition-all">
                <Share2 size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#CE2029] transition-all">
                <Heart size={18} />
              </button>
           </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:px-10 lg:pt-12">
          
          {/* LEFT COLUMN: Banner & Highlights */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative w-full overflow-hidden lg:rounded-none lg:shadow-2xl lg:shadow-[#CE2029]/10 group">
              <img
                src={event.image}
                alt={event.title}
                className="w-full object-cover lg:aspect-[4/5] lg:max-h-[700px] transition-transform duration-1000 group-hover:scale-110"
                style={{ maxHeight: '420px', objectPosition: 'top' }}
              />
              {/* Mobile Navigation Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 lg:hidden" />
              <button
                onClick={() => navigate(-1)}
                className="lg:hidden absolute top-2 left-0 flex items-center justify-center text-white z-[60] p-2"
              >
                <ArrowLeft size={24} className="drop-shadow-md" />
              </button>

              <button 
                onClick={() => {
                  const shareData = {
                    title: event.title,
                    text: `Check out ${event.title} - ${event.subtitle} at AMM Sports Arena!`,
                    url: window.location.href,
                  };
                  if (navigator.share) {
                    navigator.share(shareData).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
                      alert('Event details copied to clipboard!');
                    });
                  }
                }}
                className="lg:hidden absolute top-2 right-2 flex items-center justify-center text-white z-[60] p-2"
              >
                <Share2 size={24} className="drop-shadow-md" />
              </button>
            </div>

            {/* Program Highlights - Desktop Version */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block space-y-8 p-8 bg-slate-50 lg:rounded-none border-l-4 border-[#CE2029]"
            >
              <h2 className="text-[10px] font-black text-[#CE2029] uppercase tracking-[0.3em]">Program Highlights</h2>
              <div className="space-y-5">
                {event.highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-[#CE2029]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={12} className="text-[#CE2029]" />
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Info & Actions */}
          <div className="lg:col-span-7 px-5 lg:px-0 pt-6 lg:pt-0 space-y-10 lg:space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[#CE2029] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.3em] mb-3">{event.badge}</p>
              <h1 className="text-3xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tighter mb-5">{event.title}</h1>
              <p className="text-sm lg:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">{event.subtitle}</p>
            </motion.div>

            {/* High-Density Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-0 lg:divide-x lg:divide-slate-100"
            >
              {[
                { icon: CalendarDays, label: 'Date', value: event.date },
                { icon: Clock, label: 'Time', value: event.time },
                { icon: MapPin, label: 'Venue', value: event.location },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none px-4 py-3 lg:px-6 lg:py-2 border border-slate-100 lg:border-none shadow-sm lg:shadow-none flex flex-col items-start gap-2"
                >
                  <div className="w-8 h-8 rounded-xl lg:bg-transparent lg:w-auto lg:h-auto bg-[#CE2029]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-[#CE2029]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="text-xs lg:text-[13px] font-black text-slate-800 leading-snug mt-1">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-[10px] font-black text-[#CE2029] uppercase tracking-[0.3em] mb-4">About This Event</h2>
              <div className="bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-5 lg:p-0 border border-slate-100 lg:border-none shadow-sm lg:shadow-none">
                <p className="text-sm lg:text-lg text-slate-600 leading-[1.8] font-medium">{event.description}</p>
              </div>
            </motion.div>

            {/* What's Included - Mobile Version Hook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <h2 className="text-[9px] font-black text-[#CE2029] uppercase tracking-[0.3em] mb-5">What's Included</h2>
              <div className="space-y-4">
                {event.highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#CE2029] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-black">{i + 1}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons - Compact on Desktop */}
            <div className="pt-4 flex gap-4 lg:max-w-md pb-20 lg:pb-0">
              <a 
                href={`tel:${event.contact.split('/')[0].trim()}`}
                className="flex-1 h-14 lg:h-12 bg-slate-900 lg:rounded-none rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10"
              >
                <Phone size={14} /> Contact
              </a>

              <button 
                onClick={() => {
                   setRegStep('form');
                   setShowRegModal(true);
                }}
                className="flex-[1.6] h-14 lg:h-12 bg-[#CE2029] lg:rounded-none rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_35px_rgba(206, 32, 41,0.3)] hover:shadow-[0_20px_45px_rgba(206, 32, 41,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowRegModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 overflow-hidden min-h-[400px]"
            >
              <button 
                onClick={() => setShowRegModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 z-10"
              >
                <X size={18} />
              </button>

              {regStep === 'success' ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#2ECC71]/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-[#2ECC71]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Registration Received!</h3>
                  <p className="text-slate-500 font-medium px-4">
                    {isFree || isTBA 
                      ? "You are registered for this event for free! Our team will contact you shortly."
                      : "Your payment was successful and your spot is reserved. Our team will contact you shortly."}
                  </p>
                  <button 
                    onClick={() => setShowRegModal(false)}
                    className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
                  >
                    Got It
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-[#CE2029] font-black text-[10px] uppercase tracking-widest mb-1">Direct Enrollment</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase italic flex items-center gap-2">
                       Join <span className="bg-slate-900 text-white px-2 py-0.5 rounded leading-none">{event.category}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="h-1 w-8 bg-[#CE2029] rounded-full" />
                    </div>
                  </div>

                  <form className="space-y-5" onSubmit={handleRegister}>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Nomenclature</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                          <User size={16} />
                        </div>
                        <input 
                          type="text" 
                          required
                          value={regForm.name}
                          onChange={handleNameChange}
                          placeholder="Athlete Name" 
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-slate-300 focus:border-[#CE2029] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Link</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                          <Phone size={16} />
                        </div>
                        <input 
                          type="tel" 
                          required
                          value={regForm.phone}
                          onChange={handlePhoneChange}
                          placeholder="10 Digits Number" 
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-slate-300 focus:border-[#CE2029] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4 pb-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-[#CE2029] rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-[0_12px_30px_rgba(206, 32, 41,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>{isFree || isTBA ? "Confirm Registration" : "Proceed to Payment"} <ChevronRight size={18} /></>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-center text-slate-400 font-medium px-6 leading-relaxed">
                      By confirming, you agree to the AMM Sports Arena terms of service and registration policies.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;
