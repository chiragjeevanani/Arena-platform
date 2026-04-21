import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, MapPin, Share2, Heart, User, Phone, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { isApiConfigured } from '../../../services/config';
import { fetchPublishedEventById, registerForEvent } from '../../../services/eventsApi';
import { listMyEventRegistrations } from '../../../services/meApi';
import { getAuthToken } from '../../../services/apiClient';
import { isCmsEventId, normalizeCmsEventForDetail } from '../../../utils/eventAdapter';

function resolveContactHref(ev) {
  if (!ev) return null;
  if (ev.contactHref) return ev.contactHref;
  const raw = String(ev.contact || '').split('/')[0].trim();
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.length >= 8) return `tel:${digits}`;
  return null;
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState('form'); // form, payment, success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '' });
   const [cmsEvent, setCmsEvent] = useState(null);
  const [cmsStatus, setCmsStatus] = useState('idle');
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (!id) {
      setCmsEvent(null);
      setCmsStatus('idle');
      return undefined;
    }
    if (!isApiConfigured()) {
      setCmsEvent(null);
      setCmsStatus('no_api');
      return undefined;
    }
    if (!isCmsEventId(id)) {
      setCmsEvent(null);
      setCmsStatus('invalid_id');
      return undefined;
    }
    let cancelled = false;
    setCmsStatus('loading');
    (async () => {
      try {
        const [data, regData] = await Promise.all([
          fetchPublishedEventById(id),
          getAuthToken() ? listMyEventRegistrations().catch(() => ({ registrations: [] })) : Promise.resolve({ registrations: [] })
        ]);
        if (cancelled) return;
        
        const normalized = normalizeCmsEventForDetail(data.content);
        setCmsEvent(normalized);
        
        // Check if already applied
        const alreadyApplied = (regData.registrations || []).some(r => r.eventId === id);
        setIsApplied(alreadyApplied);
        
        setCmsStatus('ok');
      } catch {
        if (!cancelled) {
          setCmsEvent(null);
          setCmsStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const event = cmsEvent;
  const contactHref = event ? resolveContactHref(event) : null;

  const isFree = event?.price?.toLowerCase().includes('free');
  const isTBA = event?.price?.toLowerCase().includes('tba');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.phone.length !== 10) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isFree || isTBA) {
        // Direct registration for free/tba events
        await registerForEvent({
          eventId: id,
          name: regForm.name,
          phone: regForm.phone
        });
        setRegStep('success');
      } else {
        // For paid events, we could either register-then-pay or pay-then-register.
        // Usually, it's better to register as "Pending" and then confirm after payment.
        // But the current flow goes to /payment.
        // I'll stick to the current flow but prepare the registration.
        const amount = parseFloat(event.price.replace(/[^0-9.]/g, '')) || 0;
        navigate('/payment', { 
            state: { 
                amount, 
                eventTitle: event.title, 
                eventCategory: event.category,
                date: event.date,
                slot: { time: event.time },
                type: 'event',
                // Pass registration info to payment page if needed to finalize on success
                registrationInfo: { eventId: id, name: regForm.name, phone: regForm.phone }
            } 
        });
      }
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
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

  if (cmsStatus === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#CE2029] font-bold text-lg">Loading event…</p>
      </div>
    );
  }

  if (cmsStatus === 'no_api') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-3">
        <p className="text-[#CE2029] font-bold text-lg">API not configured</p>
        <p className="text-slate-600 text-sm max-w-md">
          Set <span className="font-mono">VITE_API_URL</span> to load published events from the server.
        </p>
      </div>
    );
  }

  if (cmsStatus === 'invalid_id') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-3">
        <p className="text-[#CE2029] font-bold text-lg">Event not found</p>
        <p className="text-slate-600 text-sm max-w-md">
          Open an event from the Events list so the link uses the published CMS id.
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
        <p className="text-[#CE2029] font-bold text-lg">Event not found or unpublished.</p>
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
            {event.highlights && event.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block space-y-8 p-8 bg-slate-50 lg:rounded-none border-l-4 border-[#CE2029]"
              >
                <h2 className="text-[10px] font-black text-[#CE2029] uppercase tracking-[0.3em]">Rules & Guidelines</h2>
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
            )}
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

            {/* What's Included Section */}
            {event.inclusions && event.inclusions.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.12 }}
               >
                 <h2 className="text-[10px] font-black text-[#CE2029] uppercase tracking-[0.3em] mb-4">What's Included</h2>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {event.inclusions.map((t, i) => (
                       <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{t}</span>
                       </div>
                    ))}
                 </div>
               </motion.div>
            )}

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
            {event.highlights && event.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <h2 className="text-[9px] font-black text-[#CE2029] uppercase tracking-[0.3em] mb-5">Rules & Guidelines</h2>
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
            )}

            {/* Action Buttons - Compact on Desktop */}
            <div className="pt-4 flex gap-4 lg:max-w-md pb-20 lg:pb-0">
              <a
                href={contactHref || '#'}
                onClick={(e) => {
                  if (!contactHref) e.preventDefault();
                }}
                className={`flex-1 h-14 lg:h-12 bg-slate-900 lg:rounded-none rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 ${!contactHref ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Phone size={14} /> Contact
              </a>

              <button 
                onClick={() => {
                   if (isApplied) return;
                   setRegStep('form');
                   setShowRegModal(true);
                }}
                disabled={isApplied}
                className={`flex-[1.6] h-14 lg:h-12 lg:rounded-none rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 ${
                  isApplied 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#CE2029] shadow-[0_15px_35px_rgba(206, 32, 41,0.3)] hover:shadow-[0_20px_45px_rgba(206, 32, 41,0.4)] hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {isApplied ? <><CheckCircle2 size={16} /> Applied</> : 'Register Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
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
