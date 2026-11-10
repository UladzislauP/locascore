import osmtogeojson from 'osmtogeojson';
import type { FeatureCollection, Geometry } from 'geojson';
import { ApiError } from '../geocoder';
import { analysisQuery } from './categories';

export const DEFAULT_OVERPASS_URL = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';
export interface OsmSnapshot { collection: FeatureCollection<Geometry>; fetchedAt: string; dataTimestamp: string | null; endpoint: string }
export interface OsmProvider { fetch(latitude: number, longitude: number): Promise<OsmSnapshot> }

export function decodeOverpass(payload: unknown): FeatureCollection<Geometry> {
  const data = payload as { elements?: unknown[]; remark?: unknown } | null;
  if (!data || data.remark || !Array.isArray(data.elements) || data.elements.length > 10000) {
    throw new ApiError(503, 'data_unavailable', 'OSM returned incomplete or oversized data.');
  }
  // The converter's flatProperties mode drops its tainted-geometry flag.
  // Flatten explicitly so incomplete polygons remain detectable downstream.
  const converted = osmtogeojson(data, { flatProperties: false });
  return { type:'FeatureCollection', features:converted.features.map(feature => ({
    ...feature, properties:{...feature.properties?.tags,id:feature.id,tainted:feature.properties?.tainted === true}
  })) };
}

export class OverpassProvider implements OsmProvider {
  constructor(private options: { endpoint?: string; fetcher?: typeof fetch } = {}) {}
  async fetch(latitude: number, longitude: number): Promise<OsmSnapshot> {
    const endpoints = this.options.endpoint ? [this.options.endpoint] :
      [DEFAULT_OVERPASS_URL, 'https://overpass.kumi.systems/api/interpreter'];
    let lastError: unknown;
    for (const endpoint of endpoints) {
      try { return await this.request(latitude, longitude, endpoint); }
      catch (error) {
        lastError = error;
        if (error instanceof ApiError && error.status === 429) throw error;
      }
    }
    throw lastError;
  }
  private async request(latitude: number, longitude: number, endpoint: string): Promise<OsmSnapshot> {
    const url = new URL(endpoint);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid Overpass endpoint');
    url.searchParams.set('data', analysisQuery(latitude, longitude));
    try {
      const response = await (this.options.fetcher || fetch)(url, {
        signal: AbortSignal.timeout(30000),
        headers: { Accept: 'application/json'}
      });
      if (response.status === 429) throw new ApiError(429, 'data_unavailable', 'OSM service is busy. Try again later.', 30);
      if (!response.ok || !response.body) throw new ApiError(503, 'data_unavailable', 'OSM service is unavailable.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder(); let bytes = 0; let raw = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > 12 * 1024 * 1024) { await reader.cancel(); throw new ApiError(503, 'data_unavailable', 'OSM response exceeded the analysis limit.'); }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
      const payload = JSON.parse(raw);
      return { collection: decodeOverpass(payload), fetchedAt: new Date().toISOString(),
        dataTimestamp: typeof payload.osm3s?.timestamp_osm_base === 'string' ? payload.osm3s.timestamp_osm_base : null, endpoint };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 504 : 503,
        'data_unavailable', 'Could not retrieve complete OSM data. Please try again later.');
    }
  }
}
