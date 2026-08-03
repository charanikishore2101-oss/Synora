import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getAccentRgb } from '../../utils/accent';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function ParticleTrail() {
  const { settings } = useSettingsStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (settings?.cursorMode !== 'particles' || settings?.reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const accentRgb = getAccentRgb(settings?.accent);

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.6) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          life: 0,
          maxLife: 30 + Math.random() * 20,
          size: Math.random() * 3 + 1.5,
          color: `rgba(${accentRgb}, ${0.4 + Math.random() * 0.4})`,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.96;

        const progress = p.life / p.maxLife;
        const alpha = Math.max(0, 1 - progress);

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.2, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [settings?.cursorMode, settings?.reducedMotion, settings?.accent]);

  if (settings?.cursorMode !== 'particles' || settings?.reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    />
  );
}
