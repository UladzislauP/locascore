import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import { distance } from '@turf/distance';
import { ApiError } from '../geocoder';
import { CountryCode } from '../countries';
import { CATEGORY_IDS, CategoryId, classify } from './categories';
import { containsPoint, geometryDistance } from './geometry';
import { OsmProvider, OsmSnapshot, OverpassProvider } from './overpass';
import { accessibilityRating, AccessibilityRating } from './rating';

export interface AnalysisObject {
  id: string; name: string | null; category: CategoryId; kind: string;
  distanceMeters: number; coordinate: number[]; osmUrl: string;
}
export interface CategoryAnalysis {
  id: CategoryId; status: 'available' | 'not_found' | 'partial' | 'data_unavailable';
  count500m: number | null; count1000m: number | null;
  nearest: AnalysisObject | null; objects: AnalysisObject[]; omittedInvalid: number;
}
export interface AnalysisResult {
  status: 'available' | 'partial'; origin: { latitude: number; longitude: number; country: CountryCode };
  radiusMeters: number; distanceMethod: 'geodesic_to_geometry'; completeness: 'unknown';
  categories: CategoryAnalysis[]; features: FeatureCollection<Geometry>;
  source: { id: string; endpoint: string; fetchedAt: string; dataTimestamp: string | null; attribution: string; license: string; licenseUrl: string };
  overallScore: number | null; overallStatus: 'preliminary' | 'not_calculated'; rating: AccessibilityRating;
}
type Candidate = { item: AnalysisObject; feature: Feature<Geometry>; exactDistance: number; wikidata: string };
const clean = (value: unknown): string => typeof value === 'string' ? value.trim().slice(0, 300) : '';

/** Conservative duplicate removal: identical IDs, same facility point/area,
 * or same-name transport boarding points within 35 m. Different named schools
 * on one campus and separate shop branches remain separate. */
function duplicate(candidate: Candidate, kept: Candidate[]): boolean {
  return kept.some(other => {
    if (other.item.id === candidate.item.id) return true;
    if (other.item.category !== candidate.item.category) return false;
    if (candidate.wikidata && candidate.wikidata === other.wikidata &&
      distance(candidate.item.coordinate, other.item.coordinate, { units: 'meters' }) <= 35) return true;
    const sameName = candidate.item.name && other.item.name && candidate.item.name.toLocaleLowerCase() === other.item.name.toLocaleLowerCase();
    if (candidate.item.category === 'transport') return !!sameName && candidate.item.kind === other.item.kind &&
      distance(candidate.item.coordinate, other.item.coordinate, { units: 'meters' }) <= 35;
    const a = candidate.feature.geometry, b = other.feature.geometry;
    const pointAreaPair = a.type === 'Point' ? containsPoint(b, a.coordinates) : b.type === 'Point' ? containsPoint(a, b.coordinates) : false;
    return pointAreaPair && candidate.item.kind === other.item.kind && (!!sameName || !candidate.item.name || !other.item.name);
  });
}

export function calculateAnalysis(snapshot: OsmSnapshot, latitude: number, longitude: number, country: CountryCode): AnalysisResult {
  const origin: Position = [longitude, latitude];
  const invalid = Object.fromEntries(CATEGORY_IDS.map(id => [id, 0])) as Record<CategoryId, number>;
  const candidates: Candidate[] = [];
  for (const feature of snapshot.collection.features) {
    const tags = feature.properties || {};
    const category = classify(tags); if (!category) continue;
    const id = String(feature.id || tags.id || '');
    if (!/^(node|way|relation)\/\d+$/.test(id)) { invalid[category.category]++; continue; }
    try {
      if (tags.tainted || !feature.geometry) throw new Error('Incomplete geometry');
      const measured = geometryDistance(origin, feature.geometry);
      if (measured.meters > 1000) continue;
      const item: AnalysisObject = { id, name: clean(tags.name) || null, ...category,
        distanceMeters: Math.round(measured.meters), coordinate: measured.coordinate,
        osmUrl: `https://www.openstreetmap.org/${id}` };
      candidates.push({ item, feature, exactDistance: measured.meters, wikidata: clean(tags.wikidata) });
    } catch { invalid[category.category]++; }
  }
  // Prefer areas over duplicate POI nodes, and relations over their tagged ways.
  const priority = (c: Candidate) => (c.feature.geometry.type === 'Point' ? 2 : c.item.id.startsWith('relation/') ? 0 : 1);
  candidates.sort((a, b) => priority(a) - priority(b) || a.exactDistance - b.exactDistance || a.item.id.localeCompare(b.item.id));
  const kept: Candidate[] = [];
  for (const candidate of candidates) if (!duplicate(candidate, kept)) kept.push(candidate);
  kept.sort((a, b) => a.exactDistance - b.exactDistance || a.item.id.localeCompare(b.item.id));
  const categories: CategoryAnalysis[] = CATEGORY_IDS.map(id => {
    const items = kept.filter(candidate => candidate.item.category === id);
    const unavailable = !items.length && invalid[id] > 0;
    return { id, status: unavailable ? 'data_unavailable' : invalid[id] ? 'partial' : items.length ? 'available' : 'not_found',
      count500m: unavailable ? null : items.filter(item => item.exactDistance <= 500).length,
      count1000m: unavailable ? null : items.length,
      nearest: items[0]?.item || null, objects: items.map(item => item.item), omittedInvalid: invalid[id] };
  });
  const rating = accessibilityRating(categories);
  return { status: categories.some(category => ['partial', 'data_unavailable'].includes(category.status)) ? 'partial' : 'available',
    origin: { latitude, longitude, country }, radiusMeters: 1000, distanceMethod: 'geodesic_to_geometry', completeness: 'unknown',
    categories, features: { type: 'FeatureCollection', features: kept.map(({ item, feature }) => ({
      type: 'Feature', id: item.id, properties: { ...item }, geometry: feature.geometry
    })) },
    source: { id: 'osm-overpass', endpoint: snapshot.endpoint, fetchedAt: snapshot.fetchedAt, dataTimestamp: snapshot.dataTimestamp,
      attribution: '© OpenStreetMap contributors', license: 'ODbL-1.0', licenseUrl: 'https://www.openstreetmap.org/copyright' },
    overallScore: rating.score, overallStatus: rating.score === null ? 'not_calculated' : 'preliminary', rating };
}

export interface AnalysisService { analyze(latitude: number, longitude: number, country: CountryCode): Promise<AnalysisResult> }
export class OsmAnalysisService implements AnalysisService {
  private cache = new Map<string, { expires: number; result: AnalysisResult }>();
  private pending = new Map<string, Promise<AnalysisResult>>();
  private lastRequest = -Infinity;
  constructor(private provider: OsmProvider = new OverpassProvider(), private now: () => number = Date.now) {}
  async analyze(latitude: number, longitude: number, country: CountryCode): Promise<AnalysisResult> {
    const key = `${country}:${latitude}:${longitude}`;
    const now = this.now(); const cached = this.cache.get(key);
    if (cached && cached.expires > now) return cached.result;
    const pending = this.pending.get(key); if (pending) return pending;
    if (this.pending.size || now - this.lastRequest < 5000) throw new ApiError(429, 'analysis_busy', 'Please wait before another OSM analysis.', 5);
    this.lastRequest = now;
    const operation = this.provider.fetch(latitude, longitude).then(snapshot => calculateAnalysis(snapshot, latitude, longitude, country));
    this.pending.set(key, operation);
    try {
      const result = await operation;
      for (const [k, item] of this.cache) if (item.expires <= now) this.cache.delete(k);
      if (this.cache.size >= 20) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { result, expires: now + 3600000 }); return result;
    } finally { this.pending.delete(key); }
  }
}
