import { distance } from '@turf/distance';
import { nearestPointOnLine } from '@turf/nearest-point-on-line';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Geometry, Position } from 'geojson';

export function geometryDistance(origin: Position, geometry: Geometry): { meters: number; coordinate: Position } {
  const checkCoordinates = (value: unknown): void => {
    if (!Array.isArray(value) || !value.length) throw new Error('Missing coordinates');
    if (typeof value[0] === 'number') {
      if (value.length < 2 || !Number.isFinite(value[0]) || !Number.isFinite(value[1]) || Math.abs(value[0]) > 180 || Math.abs(value[1]) > 90) throw new Error('Invalid WGS84 coordinates');
    } else value.forEach(checkCoordinates);
  };
  if (geometry.type !== 'GeometryCollection') checkCoordinates(geometry.coordinates);
  const candidates: { meters: number; coordinate: Position }[] = [];
  const addPoint = (coordinate: Position) => candidates.push({ meters: distance(origin, coordinate, { units: 'meters' }), coordinate });
  const addLine = (coordinates: Position[]) => {
    if (coordinates.length < 2) throw new Error('Invalid line');
    const snapped = nearestPointOnLine({ type: 'LineString', coordinates }, origin, { units: 'meters' });
    addPoint(snapped.geometry.coordinates);
  };
  switch (geometry.type) {
    case 'Point': addPoint(geometry.coordinates); break;
    case 'MultiPoint': geometry.coordinates.forEach(addPoint); break;
    case 'LineString': addLine(geometry.coordinates); break;
    case 'MultiLineString': geometry.coordinates.forEach(addLine); break;
    case 'Polygon':
      if (booleanPointInPolygon(point(origin), geometry)) return { meters: 0, coordinate: origin };
      geometry.coordinates.forEach(addLine); break;
    case 'MultiPolygon':
      if (booleanPointInPolygon(point(origin), geometry)) return { meters: 0, coordinate: origin };
      geometry.coordinates.forEach(polygon => polygon.forEach(addLine)); break;
    case 'GeometryCollection': geometry.geometries.forEach(item => candidates.push(geometryDistance(origin, item))); break;
  }
  candidates.sort((a, b) => a.meters - b.meters);
  if (!candidates.length || !Number.isFinite(candidates[0].meters)) throw new Error('Invalid geometry');
  return candidates[0];
}

export function containsPoint(geometry: Geometry, coordinate: Position): boolean {
  return (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') && booleanPointInPolygon(point(coordinate), geometry);
}
