export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  mode: ThemeMode;
  bg: string;
  surface: string;
  surfaceSoft: string;
  surfacePressed: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Primary forest green */
  primary: string;
  primaryText: string;
  /** Warm terracotta accent (active tab / highlights) */
  coral: string;
  /** Flat organic pastel tiles (zero gradients) */
  sageBg: string;
  sageText: string;
  peachBg: string;
  peachText: string;
  sandBg: string;
  sandText: string;
  slateBg: string;
  slateText: string;
  /** Banner dark forest card */
  bannerBg: string;
  bannerText: string;
  bannerMuted: string;
  /** Code block (calm dark slate for high readability) */
  codeBg: string;
  codeBorder: string;
  codeText: string;
  codeLineNum: string;
  /** Semantic feedback */
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
}

export const LIGHT_PALETTE: ThemePalette = {
  mode: 'light',
  bg: '#F6F5F0',
  surface: '#FFFFFF',
  surfaceSoft: '#EFECE6',
  surfacePressed: '#ECEAE3',
  border: '#E8E5DD',
  borderSubtle: '#F0EDE6',
  textPrimary: '#1A1C1A',
  textSecondary: '#525752',
  textMuted: '#8B908B',
  primary: '#1E4D3B',
  primaryText: '#FFFFFF',
  coral: '#D9724B',
  sageBg: '#E6F2EC',
  sageText: '#1E4D3B',
  peachBg: '#F9EAE1',
  peachText: '#A84E2D',
  sandBg: '#FBF3D9',
  sandText: '#8F6816',
  slateBg: '#EBF0F5',
  slateText: '#2F4D73',
  bannerBg: '#1E4D3B',
  bannerText: '#FFFFFF',
  bannerMuted: '#C7DDD3',
  codeBg: '#191C1A',
  codeBorder: '#2A2E2B',
  codeText: '#F2F0EA',
  codeLineNum: '#6B726D',
  success: '#1E7A52',
  successBg: '#E6F4ED',
  error: '#C0443A',
  errorBg: '#FBEAE8',
  warning: '#A66D14',
  warningBg: '#FDF4E1',
};

export const DARK_PALETTE: ThemePalette = {
  mode: 'dark',
  bg: '#111312',
  surface: '#1A1D1B',
  surfaceSoft: '#222623',
  surfacePressed: '#282D2A',
  border: '#2A2F2C',
  borderSubtle: '#222624',
  textPrimary: '#F3F2EC',
  textSecondary: '#B5BBB6',
  textMuted: '#7E8580',
  primary: '#3BA176',
  primaryText: '#0C1712',
  coral: '#E88761',
  sageBg: '#172921',
  sageText: '#7CD4AE',
  peachBg: '#2B1E19',
  peachText: '#F0A486',
  sandBg: '#2A2416',
  sandText: '#E7C873',
  slateBg: '#1A232E',
  slateText: '#93B7E0',
  bannerBg: '#193B2D',
  bannerText: '#F5F4EE',
  bannerMuted: '#A8CCBC',
  codeBg: '#131614',
  codeBorder: '#2A2F2C',
  codeText: '#EFECE6',
  codeLineNum: '#5E6661',
  success: '#4CC38A',
  successBg: '#13281E',
  error: '#EC6B61',
  errorBg: '#2C1615',
  warning: '#E5AE4E',
  warningBg: '#2A2112',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 34,
} as const;

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const TYPOGRAPHY = {
  mono: 'monospace',
  display: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.6, lineHeight: 32 },
  h1: { fontSize: 21, fontWeight: '700' as const, letterSpacing: -0.4, lineHeight: 27 },
  h2: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 23 },
  h3: { fontSize: 15, fontWeight: '600' as const, letterSpacing: -0.1, lineHeight: 21 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodyStrong: { fontSize: 14, fontWeight: '600' as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 17 },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4, lineHeight: 15 },
  code: { fontSize: 13, fontFamily: 'monospace', lineHeight: 20 },
} as const;
