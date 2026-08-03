import { useEffect, useRef } from 'react';

export function useTilt3D(maxAngle = 12) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        return;
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxAngle;
      const rotateY = ((x - centerX) / centerX) * maxAngle;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.5s ease-out';
    };

    const handleMouseEnter = () => {
      el.style.transition = 'transform 0.1s ease-out';
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [maxAngle]);

  return ref;
}
