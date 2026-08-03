import type { AccentColor } from '../types';

export function getAccentRgb(accent?: AccentColor): string {
  switch (accent) {
    case 'cyan':
      return '6, 182, 212';
    case 'emerald':
      return '16, 185, 129';
    case 'rose':
      return '244, 63, 94';
    case 'amber':
      return '245, 158, 11';
    case 'violet':
    default:
      return '139, 92, 246';
  }
}
