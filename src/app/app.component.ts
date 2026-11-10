import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { Copy, LANGUAGES, Language, TRANSLATIONS } from './i18n';
import { IconComponent } from './icon.component';
import { LocationMapComponent } from './map.component';
import { AnalysisObject, AnalysisResult, CategoryId, Country, Place } from './models';
import { AreaAnalysisComponent } from './area-analysis.component';

@Component({
  selector: 'app-root', imports: [FormsModule, MatButtonModule, MatProgressSpinnerModule, IconComponent, LocationMapComponent, AreaAnalysisComponent],
  templateUrl: './app.component.html', styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  private api = inject(ApiService);
  private request?: Subscription;
  private configRequest?: Subscription;
  private countriesRequest?: Subscription;
  readonly languages = LANGUAGES;
  lang = signal<Language>('pl');
  copy = computed<Copy>(() => TRANSLATIONS[this.lang()]);
  query = '';
  loading = signal(false);
  searched = signal(false);
  results = signal<Place[]>([]);
  selected = signal<Place | null>(null);
  errorKey = signal<keyof Copy | null>(null);
  tileUrl = signal('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  countries = signal<Country[]>([]);
  country = signal<Country | null>(null);
  countriesLoading = signal(true);
  countriesError = signal(false);
  analysis = signal<AnalysisResult | null>(null);
  activeCategory = signal<CategoryId>('parks');
  focusedObject = signal<AnalysisObject | null>(null);
  nearbyFeatures = computed(() => {
    const data = this.analysis();
    return data ? { ...data.features, features: data.features.features.filter(feature => feature.properties?.['category'] === this.activeCategory()) } : null;
  });
  setAnalysis(data: AnalysisResult | null) { this.analysis.set(data); this.focusedObject.set(null); }

  constructor() {
    try { this.setLanguage(localStorage.getItem('locascore-language') || 'pl'); } catch { /* Optional preference. */ }
    effect(() => {
      document.documentElement.lang = this.lang();
      document.documentElement.dataset['theme'] = 'light';
      try { localStorage.setItem('locascore-language', this.lang()); } catch { /* Optional preference. */ }
    });
    this.configRequest = this.api.layers().subscribe({
      next: value => {
        const url = value.layers.find(layer => layer.id === 'osm')?.url;
        if (url && /^https:\/\//.test(url)) this.tileUrl.set(url);
      }, error: () => { /* Keep the standard OSM endpoint if configuration is unavailable. */ }
    });
    this.loadCountries();
  }
  loadCountries() {
    this.countriesRequest?.unsubscribe();
    this.countriesLoading.set(true); this.countriesError.set(false);
    this.countriesRequest = this.api.countries().subscribe({
      next: response => { this.countries.set(response.countries); this.countriesLoading.set(false); },
      error: () => { this.countriesError.set(true); this.countriesLoading.set(false); }
    });
  }
  selectCountry(country: Country) { this.clear(); this.country.set(country); }
  changeCountry() { this.clear(); this.country.set(null); }
  setLanguage(value: string) {
    if (LANGUAGES.some(language => language.code === value)) this.lang.set(value as Language);
  }
  editQuery(value: string) {
    this.setAnalysis(null);
    this.request?.unsubscribe();
    this.query = value; this.loading.set(false); this.results.set([]);
    this.searched.set(false); this.selected.set(null); this.errorKey.set(null);
  }
  search() {
    this.setAnalysis(null);
    const country = this.country();
    if (!country) return;
    const q = this.query.trim();
    if (q.length < 3 || q.length > 200) { this.errorKey.set('invalid'); return; }
    this.request?.unsubscribe();
    this.loading.set(true); this.errorKey.set(null); this.results.set([]);
    this.searched.set(false); this.selected.set(null);
    this.request = this.api.search(q, this.lang(), country.code).subscribe({
      next: response => {
        this.results.set(response.results); this.loading.set(false); this.searched.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorKey.set(error.status === 429 ? 'rateError' : error.status === 504 ? 'timeout' : error.status === 400 ? 'invalid' : 'error');
      }
    });
  }
  choose(place: Place) {
    this.setAnalysis(null);
    this.request?.unsubscribe(); this.loading.set(false); this.query = place.label;
    this.selected.set(place); this.results.set([]); this.searched.set(false); this.errorKey.set(null);
  }
  clear() { this.editQuery(''); }
  dismissResults() { this.results.set([]); this.searched.set(false); this.errorKey.set(null); }
  ngOnDestroy() { this.request?.unsubscribe(); this.configRequest?.unsubscribe(); this.countriesRequest?.unsubscribe(); }
}
