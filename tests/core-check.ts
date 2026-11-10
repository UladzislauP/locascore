import assert from 'node:assert/strict';
import { PhotonGeocoder } from '../src/shared/geocoder';
import { OverpassProvider } from '../src/shared/analysis/overpass';
import { OsmAnalysisService } from '../src/shared/analysis/service';
import { COUNTRIES } from '../src/shared/countries';
import { accessibilityRating } from '../src/shared/analysis/rating';
async function main() {
 assert.equal(COUNTRIES.length,2);
 let searches=0;
 const geocoder=new PhotonGeocoder({fetcher:async (url,options)=>{
  assert.equal(new URL(String(url)).origin,'https://photon.komoot.io');
  assert.ok(!Object.keys(options?.headers || {}).some(k=>k.toLowerCase()==='user-agent'));
  searches++;
  return Response.json({features:[{geometry:{type:'Point',coordinates:[21,52]},properties:{countrycode:'PL',name:'Test',osm_id:1,osm_type:'N'}}]});
 }});
 assert.equal((await geocoder.search('Warszawa','en','PL')).results.length,1);
 await geocoder.search('Warszawa','en','PL');assert.equal(searches,1);
 let requests=0;
 const provider=new OverpassProvider({fetcher:async (_url,options)=>{
  requests++;assert.ok(!Object.keys(options?.headers || {}).some(k=>k.toLowerCase()==='user-agent'));
  return Response.json({elements:[{type:'node',id:1,lat:52,lon:21,tags:{amenity:'school',name:'Test school'}}]});
 }});
 const service=new OsmAnalysisService(provider);
 const result=await service.analyze(52,21,'PL');
 const schools=result.categories.find(c=>c.id==='schools');
 assert.equal(schools?.count1000m,1);assert.equal(schools?.nearest?.distanceMeters,0);
 assert.equal(result.rating?.version,'osm-accessibility-v1');
 assert.equal(accessibilityRating([]).score,null);
 await service.analyze(52,21,'PL');assert.equal(requests,1);
 const broken=new OverpassProvider({fetcher:async ()=>{throw new Error('offline')}});
 await assert.rejects(()=>broken.fetch(52,21));
 console.log('PASS: countries, real-format geocoding, browser-safe headers, OSM conversion, geometry distances, cache and unavailable-data errors. Fixture-based checks; no fabricated live results.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
