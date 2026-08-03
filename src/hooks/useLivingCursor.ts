import { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function useLivingCursor() {
  const { settings } = useSettingsStore();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [velocity, setVelocity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverType, setHoverType] = useState<'button' | 'input' | 'card' | 'link' | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastPosRef = useRef({ x: -100, y: -100 });
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    if (settings.cursorMode === 'disabled' || settings.reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastTimeRef.current);
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      setVelocity(Math.min(speed * 30, 2.5));
      setPosition({ x: e.clientX, y: e.clientY });

      lastPosRef.current = { x: e.clientX, y: e.clientY };
      lastTimeRef.current = now;

      // Element detection
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, [data-magnetic], [data-tilt], [data-cursor]');
        if (interactive) {
          setIsHovered(true);
          const tagName = interactive.tagName.toLowerCase();
          if (tagName === 'button' || interactive.getAttribute('data-magnetic') !== null) {
            setHoverType('button');
          } else if (tagName === 'input' || tagName === 'textarea' || interactive.getAttribute('data-cursor') === 'search') {
            setHoverType('input');
          } else if (interactive.getAttribute('data-tilt') !== null) {
            setHoverType('card');
          } else {
            setHoverType('link');
          }
        } else {
          setIsHovered(false);
          setHoverType(null);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (settings.cursorMode === 'disabled') return;
      const newRipple: Ripple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [settings.cursorMode, settings.reducedMotion]);

  // Remove old ripples
  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    position,
    velocity,
    isHovered,
    hoverType,
    ripples,
    removeRipple,
  };
}
