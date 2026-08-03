import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getAccentRgb } from '../../utils/accent';

export function AuroraBackground() {
  const { settings } = useSettingsStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += settings?.reducedMotion ? 0.001 : 0.005;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const accentRgb = getAccentRgb(settings?.accent);

      // Gradient Orbs
      const orb1X = w * 0.3 + Math.sin(time) * 120;
      const orb1Y = h * 0.3 + Math.cos(time * 0.8) * 100;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, w * 0.45);
      grad1.addColorStop(0, `rgba(${accentRgb}, 0.25)`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      const orb2X = w * 0.7 + Math.cos(time * 1.1) * 150;
      const orb2Y = h * 0.6 + Math.sin(time * 0.9) * 120;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, w * 0.5);
      grad2.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      const orb3X = w * 0.5 + Math.sin(time * 0.7) * 200;
      const orb3Y = h * 0.8 + Math.cos(time * 1.2) * 140;
      const grad3 = ctx.createRadialGradient(orb3X, orb3Y, 0, orb3X, orb3Y, w * 0.4);
      grad3.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, w, h);

      // Mouse Spotlight
      const spotGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 350);
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [settings?.reducedMotion, settings?.accent, settings?.theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
    />
  );
}
