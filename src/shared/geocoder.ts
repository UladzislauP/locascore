import { COUNTRIES, CountryCode } from './countries';
export const ATTRIBUTION = '© OpenStreetMap contributors · Geocoding by Photon';

export interface Place {
  id: string; label: string; latitude: number; longitude: number;
  kind: string; precision: 'address' | 'street' | 'place'; source: 'photon';
}
export interface SearchResult {
  results: Place[]; attribution: string; fetchedAt: string;
  country: CountryCode; coverageType: 'country';
}
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string,
    public retryAfter?: number) { super(message); }
}

export function validCoordinates(lon: number, lat: number): boolean {
  return Number.isFinite(lon) && Number.isFinite(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

/** Normalize real provider features only; never infer a missing house number. */
export function normalize(payload: unknown, country: CountryCode = 'PL'): Place[] {
  if (!payload || typeof payload !== 'object' ||
    !Array.isArray((payload as { features?: unknown }).features)) {
    throw new ApiError(502, 'invalid_provider_response', 'Geocoding provider returned invalid data.');
  }
  const places: Place[] = [];
  const seen = new Set<string>();
  for (const feature of (payload as { features: unknown[] }).features) {
    if (!feature || typeof feature !== 'object') continue;
    const f = feature as { geometry?: { type?: string; coordinates?: unknown[] }; properties?: Record<string, unknown> };
    const p = f.properties;
    const coords = f.geometry?.coordinates;
    if (f.geometry?.type !== 'Point' || !coords || !p) continue;
    const [lon, lat] = coords;
    if (typeof lon !== 'number' || typeof lat !== 'number' || !validCoordinates(lon, lat)) continue;
    // Require provider country metadata; a rectangular extent is not a border.
    if (String(p.countrycode || '').toUpperCase() !== country) continue;
    const str = (key: string) => typeof p[key] === 'string' ? p[key] as string : '';
    const street = [str('street'), str('housenumber')].filter(Boolean).join(' ');
    const label = [...new Set([str('name'), street, str('postcode'), str('city') || str('locality')]
      .filter(Boolean))].join(', ');
    if (!label) continue;
    const id = p.osm_id ? `osm:${String(p.osm_type)}:${String(p.osm_id)}` : `point:${lon}:${lat}`;
    if (seen.has(id)) continue;
    seen.add(id);
    places.push({ id, label, latitude: lat, longitude: lon,
      kind: str('osm_value') || 'place', precision: str('housenumber') ? 'address' : str('street') ? 'street' : 'place',
      source: 'photon' });
  }
  return places.slice(0, 6);
}

export type SearchLanguage = 'pl' | 'en' | 'be' | 'ru';
export interface SearchService { search(q: string, lang: SearchLanguage, country?: CountryCode): Promise<SearchResult> }
export class PhotonGeocoder implements SearchService {
  private cache = new Map<string, { expires: number; value: SearchResult }>();
  private pending = new Map<string, Promise<SearchResult>>();
  private lastRequest = -Infinity;
  private readonly baseUrl: string;
  constructor(private options: {
    baseUrl?: string; intervalMs?: number; ttlMs?: number;
    fetcher?: typeof fetch; now?: () => number;
  } = {}) {
    this.baseUrl = options.baseUrl || 'https://photon.komoot.io';
    const url = new URL(this.baseUrl);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid Photon endpoint');
  }

  async search(q: string, lang: SearchLanguage, country: CountryCode = 'PL'): Promise<SearchResult> {
    const key = `${country}:${lang}:${q.trim().toLocaleLowerCase('pl')}`;
    const now = (this.options.now || Date.now)();
    const cached = this.cache.get(key);
    if (cached && cached.expires > now) return cached.value;
    const existing = this.pending.get(key);
    if (existing) return existing;
    const interval = this.options.intervalMs ?? Number(1500);
    if (now - this.lastRequest < interval) {
      throw new ApiError(429, 'rate_limited', 'Please wait before another address search.',
        Math.max(1, Math.ceil((interval - now + this.lastRequest) / 1000)));
    }
    this.lastRequest = now;
    const promise = this.request(q.trim(), lang, country);
    this.pending.set(key, promise);
    try {
      const value = await promise;
      for (const [k, v] of this.cache) if (v.expires <= now) this.cache.delete(k);
      if (this.cache.size >= 200) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { expires: now + (this.options.ttlMs ??
        Number(86400000)), value });
      return value;
    } finally { this.pending.delete(key); }
  }

  private async request(q: string, lang: SearchLanguage, country: CountryCode): Promise<SearchResult> {
    const url = new URL('api/', this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/');
    const region = COUNTRIES.find(item => item.code === country)!;
    url.search = new URLSearchParams({ q, limit: '8', countrycode: country,
      lat: String(region.center[1]), lon: String(region.center[0]) }).toString();
    // The demo does not guarantee Polish, Belarusian or Russian translation
    // indexes. Keep local OSM names rather than request unsupported languages.
    if (lang === 'en') url.searchParams.set('lang', 'en');
    try {
      const response = await (this.options.fetcher || fetch)(url, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json'}
      });
      if (response.status === 429) throw new ApiError(429, 'provider_rate_limited', 'Geocoding provider is busy. Try again later.', 10);
      if (!response.ok) throw new ApiError(502, 'provider_unavailable', 'Geocoding provider is unavailable.');
      const results = normalize(await response.json(), country);
      return { results, attribution: ATTRIBUTION, fetchedAt: new Date().toISOString(),
        country, coverageType: 'country' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) {
        throw new ApiError(504, 'provider_timeout', 'Geocoding provider took too long to respond.');
      }
      throw new ApiError(502, 'provider_unavailable', 'Cannot contact the geocoding provider.');
    }
  }
}
