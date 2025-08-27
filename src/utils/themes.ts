export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    card: string;
    cardHover: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    background: string;
    card: string;
    button: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Purple Dream',
    description: 'Vibrant purple and pink gradients',
    emoji: '💜',
    colors: {
      primary: '#c91af4',
      secondary: '#00bde6',
      accent: '#FFD93D',
      background: '#f3e8ff',
      backgroundAlt: '#fce4ff',
      card: 'rgba(255, 255, 255, 0.9)',
      cardHover: 'rgba(255, 255, 255, 0.95)',
      text: '#1f2937',
      textMuted: '#6b7280',
      border: 'rgba(255, 255, 255, 0.2)',
      success: '#4ECDC4',
      warning: '#FF6B6B',
      error: '#ef4444',
      info: '#00bde6',
    },
    gradients: {
      primary: 'from-purple-400 via-pink-300 to-indigo-400',
      background: 'from-purple-400 via-pink-300 to-indigo-400',
      card: 'from-white/90 to-white/80',
      button: 'from-primary-500 to-secondary-500',
    },
  },
  {
    id: 'floral',
    name: 'Spring Garden',
    description: 'Soft florals with pastel tones',
    emoji: '🌸',
    colors: {
      primary: '#f8b4d9',
      secondary: '#a0d8c1',
      accent: '#ffd97d',
      background: '#fff5f7',
      backgroundAlt: '#f0fdf4',
      card: 'rgba(255, 255, 255, 0.95)',
      cardHover: 'rgba(255, 255, 255, 1)',
      text: '#2d3748',
      textMuted: '#718096',
      border: 'rgba(255, 182, 193, 0.3)',
      success: '#68d391',
      warning: '#f6ad55',
      error: '#fc8181',
      info: '#90cdf4',
    },
    gradients: {
      primary: 'from-pink-200 via-rose-100 to-teal-100',
      background: 'from-pink-100 via-purple-50 to-green-50',
      card: 'from-white/95 to-pink-50/30',
      button: 'from-pink-400 to-rose-400',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Cool blues and aqua waves',
    emoji: '🌊',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#67e8f9',
      background: '#f0fdff',
      backgroundAlt: '#e0f2fe',
      card: 'rgba(255, 255, 255, 0.92)',
      cardHover: 'rgba(255, 255, 255, 0.98)',
      text: '#0c4a6e',
      textMuted: '#0e7490',
      border: 'rgba(6, 182, 212, 0.2)',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#38bdf8',
    },
    gradients: {
      primary: 'from-cyan-400 via-blue-400 to-teal-400',
      background: 'from-cyan-100 via-blue-100 to-indigo-100',
      card: 'from-white/92 to-cyan-50/40',
      button: 'from-cyan-500 to-blue-500',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm oranges and golden hues',
    emoji: '🌅',
    colors: {
      primary: '#fb923c',
      secondary: '#f97316',
      accent: '#fcd34d',
      background: '#fff7ed',
      backgroundAlt: '#fef3c7',
      card: 'rgba(255, 255, 255, 0.93)',
      cardHover: 'rgba(255, 255, 255, 0.98)',
      text: '#7c2d12',
      textMuted: '#92400e',
      border: 'rgba(251, 146, 60, 0.25)',
      success: '#84cc16',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#60a5fa',
    },
    gradients: {
      primary: 'from-orange-400 via-red-400 to-pink-400',
      background: 'from-orange-100 via-yellow-50 to-red-50',
      card: 'from-white/93 to-orange-50/30',
      button: 'from-orange-500 to-red-500',
    },
  },
  {
    id: 'forest',
    name: 'Forest Walk',
    description: 'Natural greens and earth tones',
    emoji: '🌲',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#86efac',
      background: '#f0fdf4',
      backgroundAlt: '#dcfce7',
      card: 'rgba(255, 255, 255, 0.91)',
      cardHover: 'rgba(255, 255, 255, 0.97)',
      text: '#14532d',
      textMuted: '#166534',
      border: 'rgba(34, 197, 94, 0.2)',
      success: '#22c55e',
      warning: '#facc15',
      error: '#f87171',
      info: '#22d3ee',
    },
    gradients: {
      primary: 'from-green-400 via-emerald-400 to-teal-400',
      background: 'from-green-100 via-emerald-50 to-lime-50',
      card: 'from-white/91 to-green-50/35',
      button: 'from-green-500 to-emerald-600',
    },
  },
  {
    id: 'minimal',
    name: 'Clean Minimal',
    description: 'Simple and elegant neutrals',
    emoji: '⚪',
    colors: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      accent: '#3b82f6',
      background: '#f9fafb',
      backgroundAlt: '#f3f4f6',
      card: 'rgba(255, 255, 255, 1)',
      cardHover: 'rgba(249, 250, 251, 1)',
      text: '#111827',
      textMuted: '#6b7280',
      border: 'rgba(229, 231, 235, 0.8)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradients: {
      primary: 'from-gray-200 via-gray-100 to-white',
      background: 'from-gray-50 to-white',
      card: 'from-white to-gray-50',
      button: 'from-gray-600 to-gray-700',
    },
  },
  {
    id: 'candy',
    name: 'Candy Shop',
    description: 'Sweet and playful pastels',
    emoji: '🍭',
    colors: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#fbbf24',
      background: '#fdf2f8',
      backgroundAlt: '#faf5ff',
      card: 'rgba(255, 255, 255, 0.94)',
      cardHover: 'rgba(255, 255, 255, 0.99)',
      text: '#831843',
      textMuted: '#be185d',
      border: 'rgba(236, 72, 153, 0.2)',
      success: '#84cc16',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#a78bfa',
    },
    gradients: {
      primary: 'from-pink-400 via-purple-400 to-indigo-400',
      background: 'from-pink-100 via-purple-100 to-yellow-50',
      card: 'from-white/94 to-pink-50/40',
      button: 'from-pink-500 to-purple-500',
    },
  },
];

export const getTheme = (themeId: string): Theme => {
  return themes.find(t => t.id === themeId) || themes[0];
};