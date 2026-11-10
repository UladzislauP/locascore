import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { defer, of, catchError, throwError } from 'rxjs';
import { Place } from './models';
import { Language } from './i18n';
import { COUNTRIES, isCountry } from '../shared/countries';
import { ApiError, PhotonGeocoder } from '../shared/geocoder';
import { OsmAnalysisService } from '../shared/analysis/service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private geocoder = new PhotonGeocoder();
  private analysis = new OsmAnalysisService();
  private failure(error: unknown) {
    return throwError(() => new HttpErrorResponse({status: error instanceof ApiError ? error.status : 503,
      error: {error: {code: error instanceof ApiError ? error.code : 'data_unavailable', message: error instanceof Error ? error.message : 'Data unavailable'}}}));
  }
  search(q: string, lang: Language, country: string) {
    return defer(() => {
      if (!isCountry(country)) throw new ApiError(400, 'invalid_country', 'Select a country.');
      return this.geocoder.search(q, lang, country);
    }).pipe(catchError(error => this.failure(error)));
  }
  layers() { return of({layers: [
    {id:'osm',name:'OpenStreetMap',status:'available' as const,type:'xyz',url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png'},
    {id:'selection',name:'Selected point',status:'available' as const,type:'local_overlay'},
    {id:'osm-surroundings',name:'OSM surroundings',status:'available_on_request' as const,type:'geojson'}
  ]}); }
  countries() { return of({countries: COUNTRIES}); }
  analyze(place: Place, country: string) {
    return defer(() => {
      if (!isCountry(country)) throw new ApiError(400, 'invalid_country', 'Select a country.');
      return this.analysis.analyze(place.latitude,place.longitude,country);
    }).pipe(catchError(error => this.failure(error)));
  }
}
