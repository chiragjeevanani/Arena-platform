import { motion } from 'framer-motion';

const Placeholder = ({ title }) => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-[#CE2029]/20 to-[#CE2029]/20 border border-[#CE2029]/30 flex items-center justify-center animate-pulse"
      >
        <div className="w-12 h-12 rounded-full border-4 border-t-[#CE2029] border-r-[#CE2029] border-b-transparent border-l-transparent animate-spin" />
      </motion.div>
      <h2 className="text-2xl md:text-3xl font-black text-white font-display mb-3">{title}</h2>
      <p className="text-white/40 max-w-sm mx-auto font-medium">
        This module is currently under development. It will be available in the upcoming release.
      </p>
    </div>
  );
};

export default Placeholder;


