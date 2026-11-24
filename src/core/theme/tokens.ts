export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  mode: ThemeMode;
  bg: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  codeBg: string;
  codeBorder: string;
  codeText: string;
  codeLineNum: string;
  success: string;
  successBg: string;
  successBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
}

export const LIGHT_PALETTE: ThemePalette = {
  mode: 'light',
  bg: '#FFFFFF',
  surface: '#F7F7F8',
  surfaceElevated: '#FFFFFF',
  surfacePressed: '#ECECEF',
  border: '#E4E4E7',
  borderStrong: '#18181B',
  textPrimary: '#09090B',
  textSecondary: '#3F3F46',
  textMuted: '#71717A',
  accent: '#09090B',
  accentText: '#FFFFFF',
  codeBg: '#F4F4F5',
  codeBorder: '#E4E4E7',
  codeText: '#18181B',
  codeLineNum: '#A1A1AA',
  success: '#15803D',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  warning: '#B45309',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
};

export const DARK_PALETTE: ThemePalette = {
  mode: 'dark',
  bg: '#0A0A0B',
  surface: '#131316',
  surfaceElevated: '#1A1A1F',
  surfacePressed: '#232329',
  border: '#27272A',
  borderStrong: '#FAFAFA',
  textPrimary: '#FAFAFA',
  textSecondary: '#D4D4D8',
  textMuted: '#8E8E98',
  accent: '#FAFAFA',
  accentText: '#09090B',
  codeBg: '#111114',
  codeBorder: '#27272A',
  codeText: '#F4F4F5',
  codeLineNum: '#52525B',
  success: '#22C55E',
  successBg: '#091E12',
  successBorder: '#14532D',
  error: '#EF4444',
  errorBg: '#220C0C',
  errorBorder: '#7F1D1D',
  warning: '#F59E0B',
  warningBg: '#221807',
  warningBorder: '#78350F',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  full: 999,
} as const;

export const TYPOGRAPHY = {
  mono: 'monospace',
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 34 },
  h1: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 28 },
  h2: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.3, lineHeight: 23 },
  h3: { fontSize: 15, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 21 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodyStrong: { fontSize: 14, fontWeight: '600' as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6, lineHeight: 14 },
  code: { fontSize: 13, fontFamily: 'monospace', lineHeight: 20 },
} as const;
