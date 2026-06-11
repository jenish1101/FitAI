export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  backgroundGradient: readonly [string, string, string];
  card: string;
  cardBorder: string;
  cardMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  chipBg: string;
  chipActive: string;
  chipActiveAlt: string;
  overlay: string;
  track: string;
  ringTrack: string;
  indigo: string;
  indigoDark: string;
  indigoLight: string;
  violet: string;
  cyan: string;
  amber: string;
  green: string;
  red: string;
  orange: string;
  gradientHero: readonly [string, string];
  gradientCard: readonly [string, string];
  gradientButton: readonly [string, string, string];
  statusBar: 'light' | 'dark';
};

export const darkTheme: ThemeColors = {
  background: '#030712',
  backgroundGradient: ['#030712', '#1e1b4b', '#030712'],
  card: 'rgba(17, 24, 39, 0.8)',
  cardBorder: '#1f2937',
  cardMuted: 'rgba(31, 41, 55, 0.5)',
  text: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  inputBg: 'rgba(17, 24, 39, 0.8)',
  inputBorder: '#1f2937',
  tabBarBg: 'rgba(3, 7, 18, 0.95)',
  tabBarBorder: '#1f2937',
  chipBg: '#1f2937',
  chipActive: '#4f46e5',
  chipActiveAlt: '#7c3aed',
  overlay: 'rgba(3, 7, 18, 0.95)',
  track: '#1f2937',
  ringTrack: '#1f2937',
  indigo: '#818cf8',
  indigoDark: '#4f46e5',
  indigoLight: '#a5b4fc',
  violet: '#a78bfa',
  cyan: '#22d3ee',
  amber: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#fb923c',
  gradientHero: ['rgba(49, 46, 129, 0.4)', 'rgba(76, 29, 149, 0.4)'],
  gradientCard: ['rgba(49, 46, 129, 0.4)', 'rgba(76, 29, 149, 0.4)'],
  gradientButton: ['#4f46e5', '#7c3aed', '#4f46e5'],
  statusBar: 'light',
};

export const lightTheme: ThemeColors = {
  background: '#f1f5f9',
  backgroundGradient: ['#f8fafc', '#e0e7ff', '#f1f5f9'],
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  cardMuted: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  tabBarBg: 'rgba(255, 255, 255, 0.95)',
  tabBarBorder: '#e2e8f0',
  chipBg: '#f1f5f9',
  chipActive: '#4f46e5',
  chipActiveAlt: '#7c3aed',
  overlay: 'rgba(241, 245, 249, 0.97)',
  track: '#e2e8f0',
  ringTrack: '#e2e8f0',
  indigo: '#4f46e5',
  indigoDark: '#4338ca',
  indigoLight: '#6366f1',
  violet: '#7c3aed',
  cyan: '#0891b2',
  amber: '#d97706',
  green: '#16a34a',
  red: '#dc2626',
  orange: '#ea580c',
  gradientHero: ['#eef2ff', '#f5f3ff'],
  gradientCard: ['#eef2ff', '#f5f3ff'],
  gradientButton: ['#4f46e5', '#7c3aed', '#4f46e5'],
  statusBar: 'dark',
};

export const themes = { light: lightTheme, dark: darkTheme };

/** @deprecated Use useTheme() instead */
export const Colors = darkTheme;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
