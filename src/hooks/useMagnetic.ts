import { useEffect, useRef } from 'react';

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLDivElement | HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distCols = e.clientX - centerX;
      const distRows = e.clientY - centerY;
      const distance = Math.sqrt(distCols * distCols + distRows * distRows);

      if (distance < rect.width * 1.5) {
        const x = distCols * strength;
        const y = distRows * strength;
        el.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
      } else {
        el.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    };

    const handleMouseLeave = () => {
      el.style.transform = 'translate3d(0px, 0px, 0px)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    };

    const handleMouseEnter = () => {
      el.style.transition = 'transform 0.1s ease-out';
    };

    window.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (el) {
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [strength]);

  return ref;
}
