import { motion, AnimatePresence } from 'framer-motion';
import { useLivingCursor } from '../../hooks/useLivingCursor';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ParticleTrail } from './ParticleTrail';

export function LivingCursor() {
  const { settings } = useSettingsStore();
  const { position, velocity, isHovered, hoverType, ripples, removeRipple } = useLivingCursor();

  if (settings.cursorMode === 'disabled' || settings.reducedMotion) {
    return null;
  }

  const isMinimal = settings.cursorMode === 'minimal';
  const isGlow = settings.cursorMode === 'glow' || settings.cursorMode === 'particles';

  return (
    <>
      <ParticleTrail />

      {/* Primary Spring Cursor Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-white transition-opacity duration-300"
        style={{
          x: position.x - 4,
          y: position.y - 4,
          width: 8,
          height: 8,
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.9)',
        }}
        animate={{
          scale: isHovered ? (hoverType === 'button' ? 2 : hoverType === 'input' ? 0.5 : 1.5) : 1 + velocity * 0.2,
          opacity: position.x < 0 ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 45 }}
      />

      {/* Outer Dynamic Glow Spotlight */}
      {!isMinimal && (
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border border-white/20"
          style={{
            x: position.x - 24,
            y: position.y - 24,
            width: 48,
            height: 48,
            background: isGlow
              ? `radial-gradient(circle, rgba(var(--accent-current), 0.25) 0%, rgba(var(--accent-current), 0) 70%)`
              : 'transparent',
          }}
          animate={{
            scale: isHovered ? (hoverType === 'button' ? 1.6 : hoverType === 'card' ? 1.8 : 1.3) : 1 + velocity * 0.4,
            borderRadius: hoverType === 'input' ? '6px' : '50%',
            opacity: position.x < 0 ? 0 : 0.85,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      )}

      {/* Click Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            className="pointer-events-none fixed z-[9997] rounded-full border border-white/40"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              boxShadow: '0 0 15px rgba(var(--accent-current), 0.6)',
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
