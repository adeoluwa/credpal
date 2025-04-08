export const SUPPORTED_CURRENCIES = [
  'NGN',
  'USD',
  'EUR',
  'GBP',
  'JPY',
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
