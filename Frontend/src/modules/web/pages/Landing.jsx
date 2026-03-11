import { ChevronRight, Play, Shield, Zap, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-fade-in">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              India's Premier Badminton Booking Platform
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
              Elevate Your Game with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Precision Booking</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Book professional badminton courts in seconds. Real-time availability, premium facilities, and seamless payments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center group">
                Start Playing Now
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center">
                <Play size={20} className="mr-2 text-emerald-600 fill-emerald-600" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-3xl -z-10 opacity-30 animate-pulse" />
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-emerald-600">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure Payments</h3>
              <p className="text-slate-500">Industry standard encryption for all your transactions and personal data.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-emerald-600">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Instant Approval</h3>
              <p className="text-slate-500">Get your booking confirmed instantly with real-time court availability.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-emerald-600">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Premium Courts</h3>
              <p className="text-slate-500">Access to top-rated indoor courts with professional flooring and lighting.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
