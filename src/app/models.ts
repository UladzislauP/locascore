export interface Place {
  id: string; label: string; latitude: number; longitude: number;
  kind: string; precision: 'address' | 'street' | 'place' | 'point';
  source: 'photon' | 'map';
}
export interface SearchResponse {
  results: Place[]; attribution: string; fetchedAt: string;
  country: string; coverageType: 'country';
}
export interface Country {
  code: string; names: Record<'en' | 'pl' | 'be' | 'ru', string>;
  nativeName: string; center: number[]; zoom: number;
}
export interface Layer {
  id: string; name: string; status: 'available' | 'available_on_request' | 'data_unavailable';
  type: string; url?: string; reason?: string;
}
import type { FeatureCollection, Geometry } from 'geojson';

export type CategoryId = 'parks' | 'water' | 'schools' | 'kindergartens' | 'groceries' | 'pharmacies' | 'transport';
export interface AnalysisObject {
  id: string; name: string | null; category: CategoryId; kind: string;
  distanceMeters: number; coordinate: number[]; osmUrl: string;
}
export interface CategoryAnalysis {
  id: CategoryId; status: 'available' | 'partial' | 'not_found' | 'data_unavailable';
  count500m: number | null; count1000m: number | null; nearest: AnalysisObject | null;
  objects: AnalysisObject[]; omittedInvalid: number;
}
export interface AnalysisResult {
  status: 'available' | 'partial'; origin: {latitude: number; longitude: number; country: string};
  radiusMeters: number; distanceMethod: 'geodesic_to_geometry'; completeness: 'unknown';
  categories: CategoryAnalysis[]; features: FeatureCollection<Geometry>;
  source: {id: string; endpoint: string; fetchedAt: string; dataTimestamp: string | null; attribution: string; license: string; licenseUrl: string};
  overallScore: number | null; overallStatus: 'not_calculated' | 'preliminary';
  rating?: {
    version: string; status: 'preliminary' | 'insufficient_data'; score: number | null;
    factors: {id: 'green' | 'daily' | 'transport' | 'health' | 'education'; weight: number; score: number | null; contribution: number | null;
      components: {category: CategoryId; distanceMeters: number | null; fullPointsWithinMeters: number; score: number | null}[]}[];
  };
}
