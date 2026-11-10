import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Polygon from 'ol/geom/Polygon.js';
import MultiPolygon from 'ol/geom/MultiPolygon.js';

/** Read the original OSM polygon, including all islands and interior rings. */
export function countryHighlight(data: object, expectedCode: string) {
  const feature = new GeoJSON().readFeature(data, {
    dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'
  });
  if (Array.isArray(feature)) throw new Error('Expected one country feature');
  const geometry = feature.getGeometry();
  if (feature.get('code') !== expectedCode || !(geometry instanceof Polygon || geometry instanceof MultiPolygon)) {
    throw new Error('Invalid country boundary');
  }
  return { outline: new Feature(geometry) };
}
