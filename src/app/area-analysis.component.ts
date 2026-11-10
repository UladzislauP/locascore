import { Component, OnDestroy, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { AnalysisObject, AnalysisResult, CategoryId, Place } from './models';
import { ANALYSIS_COPY, RATING_COPY } from './analysis-copy';
import { Language } from './i18n';
import { IconComponent } from './icon.component';
import { CATEGORY_MARKERS } from './nearby-marker';

@Component({
  selector: 'app-area-analysis', imports: [MatButtonModule, MatProgressSpinnerModule, IconComponent],
  template: `
    @if (!opened()) {
      <button class="launcher" type="button" (click)="open()"><span class="launcher-icon"><app-icon name="compass"/></span><span>{{ text().open }}</span><app-icon class="launcher-arrow" name="arrow"/></button>
    } @else {
      <section class="analysis-panel" aria-labelledby="analysis-heading">
        <header><div><h2 id="analysis-heading">{{ text().title }}</h2><p class="address">{{ place().label }}</p></div><button mat-icon-button (click)="close()" [attr.aria-label]="text().close"><app-icon name="close"/></button></header>
        <div class="panel-body" aria-live="polite" [attr.aria-busy]="loading()">
          @if (loading()) { <div class="analysis-loading"><mat-spinner diameter="26"/><p>{{ text().loading }}</p></div> }
          @else if (error()) { <p class="notice" role="alert">{{ error() === 'busy' ? text().busy : text().unavailable }}</p><button mat-button (click)="run()">{{ text().retry }}</button> }
          @else if (result(); as data) {
            @if (data.rating; as rating) {
              <section class="score-card" [attr.aria-label]="text().scoreTitle">
                <div class="score-top"><div><p class="eyebrow">{{ text().scoreTitle }}</p><span class="preliminary">{{ text().preliminary }}</span></div><div class="score-value"><strong>{{ rating.score ?? '—' }}</strong><span>/ 100</span></div></div>
                <p class="score-caption">{{ text().scoreCaption }}</p>
                @if (rating.score === null) { <p class="score-note">{{ text().scoreUnavailable }}</p> }
                <div class="score-factors">
                  @for (factor of rating.factors; track factor.id) {
                    <div class="factor"><span>{{ text().factors[factor.id] }}<small>{{ factor.weight }}%</small></span><div class="factor-track"><i [style.width.%]="factor.score ?? 0"></i></div><b>{{ factor.score === null ? '—' : round(factor.score) }}</b></div>
                  }
                </div>
                <details><summary>{{ text().method }}</summary><p>{{ text().scoreHelp }}</p>
                  @for (factor of rating.factors; track factor.id) {
                    @for (part of factor.components; track part.category) {
                      <p class="method-row"><span>{{ text().categories[part.category] }}</span><span>100 {{ text().points }} ≤ {{ part.fullPointsWithinMeters }} {{ text().meters }}</span></p>
                    }
                  }
                  <p>{{ text().scoreFormula }}</p>
                </details>
              </section>
            }
            <p class="distance-help">{{ text().distanceHelp }}</p>
            <div class="categories">
              @for (category of data.categories; track category.id) {
                <button (click)="selectCategory(category.id)" [class.active]="activeCategory() === category.id" [attr.aria-pressed]="activeCategory() === category.id" [style.--category-color]="markers[category.id].color">
                  <span class="category-icon"><app-icon [name]="markers[category.id].icon"/></span><span>{{ text().categories[category.id] }}<small>{{ category.nearest ? formatDistance(category.nearest.distanceMeters) : '—' }}</small></span><b>{{ category.count1000m ?? '—' }}</b>
                </button>
              }
            </div>
            @if (active(); as category) {
              <div class="counts"><span>{{ text().counts }}</span><strong>500 {{ text().meters }}: {{ category.count500m ?? '—' }}</strong><strong>1 {{ text().kilometers }}: {{ category.count1000m ?? '—' }}</strong></div>
              @if (category.id === 'transport') { <p class="notice">{{ text().transportHelp }}</p> }
              @if (category.status === 'partial') { <p class="notice">{{ text().partial }}</p> }
              @if (category.status === 'data_unavailable') { <p class="notice">{{ text().unavailable }}</p> }
              @else if (!category.objects.length) { <p class="notice">{{ text().none }}</p> }
              @else {
                <h3>{{ text().nearby }}</h3>
                <ul class="objects">
                  @for (item of visibleObjects(); track item.id) {
                    <li><button (click)="focus(item)" [class.active-object]="activeObject() === item.id"><span>{{ item.name || kindLabel(item) }}<small>{{ kindLabel(item) }}</small></span><strong>{{ formatDistance(item.distanceMeters) }}</strong></button><a [href]="item.osmUrl" target="_blank" rel="noopener noreferrer" [attr.aria-label]="text().openOsm"><app-icon name="arrow"/></a></li>
                  }
                </ul>
              }
            }
            <footer><p>{{ text().coverageHelp }}</p>@if (data.source.dataTimestamp) { <p>{{ text().sourceDate }}: {{ formatDate(data.source.dataTimestamp!) }}</p> }<a [href]="data.source.licenseUrl" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors · ODbL</a></footer>
          }
        </div>
      </section>
    }
  `,
  styleUrl: './area-analysis.component.scss'
})
export class AreaAnalysisComponent implements OnDestroy {
  place = input.required<Place>(); country = input.required<string>(); lang = input.required<Language>();
  focusedObject = input<AnalysisObject | null>(null);
  analysisChange = output<AnalysisResult | null>(); categoryChange = output<CategoryId>(); objectFocus = output<AnalysisObject>();
  private api = inject(ApiService); private request?: Subscription;
  text = computed(() => ({...ANALYSIS_COPY[this.lang()],...RATING_COPY[this.lang()]}));
  opened = signal(false); loading = signal(false); error = signal<'busy' | 'unavailable' | null>(null);
  result = signal<AnalysisResult | null>(null); activeCategory = signal<CategoryId>('parks'); activeObject = signal<string | null>(null);
  active = computed(() => this.result()?.categories.find(category => category.id === this.activeCategory()));
  markers = CATEGORY_MARKERS;
  visibleObjects = computed(() => {
    const items = this.active()?.objects || [], selected = items.find(item => item.id === this.activeObject());
    const nearest = items.slice(0,5);
    return selected && !nearest.includes(selected) ? [...nearest.slice(0,4),selected] : nearest;
  });
  constructor() {
    effect(() => this.activeObject.set(this.focusedObject()?.id || null));
    effect(() => {
      this.place(); this.country();
      this.request?.unsubscribe(); this.result.set(null); this.error.set(null);
      this.loading.set(false); this.opened.set(false); this.activeObject.set(null);
      this.analysisChange.emit(null);
    });
  }
  open() {
    this.opened.set(true);
    if (this.result()) { this.analysisChange.emit(this.result()); this.categoryChange.emit(this.activeCategory()); }
    else this.run();
  }
  run() {
    this.request?.unsubscribe(); this.loading.set(true); this.error.set(null); this.analysisChange.emit(null);
    this.request = this.api.analyze(this.place(), this.country()).subscribe({
      next: data => {
        this.result.set(data); this.loading.set(false); this.analysisChange.emit(data);
        this.selectCategory(data.categories.find(category => category.objects.length)?.id || 'parks');
      },
      error: (error: HttpErrorResponse) => { this.loading.set(false); this.error.set(error.status === 429 ? 'busy' : 'unavailable'); }
    });
  }
  close() { this.request?.unsubscribe(); this.loading.set(false); this.opened.set(false); this.analysisChange.emit(null); }
  selectCategory(id: CategoryId) { this.activeCategory.set(id); this.activeObject.set(null); this.categoryChange.emit(id); }
  focus(item: AnalysisObject) { this.activeObject.set(item.id); this.objectFocus.emit(item); }
  kindLabel(item: AnalysisObject) { return this.text().kinds[item.kind] || this.text().categories[item.category]; }
  round(value: number) { return Math.round(value); }
  formatDistance(meters: number) { return '≈ ' + new Intl.NumberFormat(this.lang(), { maximumFractionDigits: meters >= 1000 ? 1 : 0 }).format(meters >= 1000 ? meters / 1000 : meters) + ' ' + (meters >= 1000 ? this.text().kilometers : this.text().meters); }
  formatDate(value: string) { return new Intl.DateTimeFormat(this.lang(), { day:'2-digit', month:'short', year:'numeric', timeZone:'UTC' }).format(new Date(value)); }
  ngOnDestroy() { this.request?.unsubscribe(); }
}
