export type CountryCode = 'PL' | 'BY';
export const COUNTRIES = [
  { code: 'PL' as const, names: { en: 'Poland', pl: 'Polska', be: 'Польшча', ru: 'Польша' },
    center: [19.1, 52.1], zoom: 6, nativeName: 'Polska' },
  { code: 'BY' as const, names: { en: 'Belarus', pl: 'Białoruś', be: 'Беларусь', ru: 'Беларусь' },
    center: [28.0, 53.5], zoom: 6, nativeName: 'Беларусь' }
];
export function isCountry(value: unknown): value is CountryCode {
  return COUNTRIES.some(country => country.code === value);
}
