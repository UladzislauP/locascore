export const CATEGORY_IDS = ['parks', 'water', 'schools', 'kindergartens', 'groceries', 'pharmacies', 'transport'] as const;
export type CategoryId = typeof CATEGORY_IDS[number];
export type Tags = Record<string, unknown>;
export function classify(tags: Tags): { category: CategoryId; kind: string } | null {
  const denied = ['private', 'no'].includes(String(tags.access)) || ['private', 'no'].includes(String(tags.foot));
  if (tags.leisure === 'park') return denied ? null : { category: 'parks', kind: 'park' };
  if (tags.natural === 'water') return { category: 'water', kind: String(tags.water || 'water') };
  if (tags.waterway === 'river') return { category: 'water', kind: 'river' };
  if (tags.amenity === 'school') return { category: 'schools', kind: 'school' };
  if (tags.amenity === 'kindergarten') return { category: 'kindergartens', kind: 'kindergarten' };
  if (['supermarket', 'convenience'].includes(String(tags.shop))) return denied ? null : { category: 'groceries', kind: String(tags.shop) };
  if (tags.amenity === 'pharmacy') return denied ? null : { category: 'pharmacies', kind: 'pharmacy' };
  if (tags.railway === 'subway_entrance') return { category: 'transport', kind: 'metro_entrance' };
  if (tags.railway === 'station' && tags.station === 'subway') return { category: 'transport', kind: 'metro_station' };
  if (tags.railway === 'station' || tags.railway === 'halt') return { category: 'transport', kind: 'rail_station' };
  if (tags.railway === 'tram_stop' || (tags.public_transport === 'platform' && tags.tram === 'yes')) return { category: 'transport', kind: 'tram_stop' };
  if (tags.highway === 'bus_stop' || (tags.public_transport === 'platform' && (tags.bus === 'yes' || tags.trolleybus === 'yes'))) return { category: 'transport', kind: 'bus_stop' };
  if (tags.public_transport === 'platform') return { category: 'transport', kind: 'platform' };
  return null;
}

export function analysisQuery(latitude: number, longitude: number) {
  const location = `${latitude.toFixed(7)},${longitude.toFixed(7)}`;
  const filters = [
    '["leisure"="park"]', '["natural"="water"]', '["waterway"="river"]',
    '["amenity"~"^(school|kindergarten|pharmacy)$"]', '["shop"~"^(supermarket|convenience)$"]',
    '["highway"="bus_stop"]', '["railway"~"^(tram_stop|station|halt|subway_entrance)$"]', '["public_transport"="platform"]'
  ];
  // Containing polygons also matter: a large park/lake may have no edge within 1 km.
  const areaFilters = ['["leisure"="park"]', '["natural"="water"]'];
  return `[out:json][timeout:20][maxsize:16777216];is_in(${location})->.containing;(\n` +
    filters.map(filter => `nwr(around:1000,${location})${filter};`).join('\n') + '\n' +
    areaFilters.flatMap(filter => [`way(pivot.containing)${filter};`, `rel(pivot.containing)${filter};`]).join('\n') +
    '\n);out body geom;';
}
