export const PLATFORM_CODES = {
  STAR: 'STAR',
  TIP: 'TIP',
  PRMS: 'PRMS'
} as const;

export type PlatformCode = typeof PLATFORM_CODES[keyof typeof PLATFORM_CODES];


