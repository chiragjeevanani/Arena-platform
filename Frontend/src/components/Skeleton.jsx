import { motion } from 'framer-motion';

const Skeleton = ({ className, height, width }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-white/5 rounded-xl ${className}`}
      style={{ height, width }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
};

export default Skeleton;
