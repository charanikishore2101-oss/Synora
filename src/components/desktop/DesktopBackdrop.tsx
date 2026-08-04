import { motion } from 'framer-motion';

export function DesktopBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Darkened Desktop Backdrop Layer */}
      <div className="absolute inset-0 bg-[#090a0f]/80 backdrop-blur-2xl transition-all duration-700" />

      {/* Subtle Desktop Ambient Lighting Mesh */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-tr from-violet-900/30 via-indigo-800/20 to-cyan-900/30 blur-[130px]"
      />

      {/* Secondary Flare */}
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/3 w-[600px] h-[400px] rounded-full bg-gradient-to-br from-purple-800/20 via-pink-900/15 to-blue-900/20 blur-[110px]"
      />

      {/* Grid Pattern overlay for native desktop utility feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
