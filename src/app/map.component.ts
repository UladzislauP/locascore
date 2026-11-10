import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import XYZ from 'ol/source/XYZ.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import type { FeatureCollection, Geometry } from 'geojson';
import type { FeatureLike } from 'ol/Feature.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Polygon from 'ol/geom/Polygon.js';
import MultiPolygon from 'ol/geom/MultiPolygon.js';
import LineString from 'ol/geom/LineString.js';
import MultiLineString from 'ol/geom/MultiLineString.js';
import { fromLonLat } from 'ol/proj.js';
import { getVectorContext } from 'ol/render.js';
import { defaults as defaultControls } from 'ol/control.js';
import { Icon, Fill, Stroke, Style } from 'ol/style.js';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from './icon.component';
import { Copy } from './i18n';
import { AnalysisObject, CategoryId, Country, Place } from './models';
import { CATEGORY_MARKERS, nearbyMarkerSvg } from './nearby-marker';
import { countryHighlight } from './country-highlight';

@Component({
  selector: 'app-location-map', imports: [MatButtonModule, IconComponent],
  template: `
    <div #mapElement class="map-canvas" tabindex="0" [attr.aria-label]="copy().mapLabel"></div>
    <div #propertyMarker class="property-marker" role="img" [attr.aria-label]="selected()?.label">
      <img #propertyPin src="markers/property-pin.svg" width="44" height="54" alt="" draggable="false"/>
    </div>
    <div class="map-tools">
      <button mat-icon-button (click)="zoom(1)" [attr.aria-label]="copy().zoomIn"><app-icon name="plus"/></button>
      <button mat-icon-button (click)="zoom(-1)" [attr.aria-label]="copy().zoomOut"><app-icon name="minus"/></button>
    </div>
    @if (tileError()) { <div class="tile-error" role="status">{{ copy().tileError }}</div> }
    @else if (boundaryError()) { <div class="tile-error" role="status">{{ copy().boundaryError }}</div> }
  `,
  styles: [`
    :host{display:block;position:absolute;inset:0;background:#e8ece5}
    .map-canvas{width:100%;height:100%}
    .property-marker{width:44px;height:54px;pointer-events:none;user-select:none;z-index:10}
    .property-marker img{display:block;width:44px;height:54px;transform-origin:50% 100%;filter:drop-shadow(0 2px 3px rgba(10,36,27,.28));pointer-events:none}
    .map-tools{position:absolute;right:16px;top:16px;display:flex;flex-direction:column;padding:3px;background:var(--surface);border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow);color:var(--ink)}
    .tile-error{position:absolute;bottom:40px;left:16px;right:16px;padding:10px 14px;background:var(--surface);color:var(--ink);border-radius:8px;font-size:12px}
  `]
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef<HTMLDivElement>;
  @ViewChild('propertyMarker', { static: true }) propertyMarker!: ElementRef<HTMLDivElement>;
  @ViewChild('propertyPin', { static: true }) propertyPin!: ElementRef<HTMLImageElement>;
  copy = input.required<Copy>();
  country = input.required<Country>();
  selected = input<Place | null>(null);
  nearbyFeatures = input<FeatureCollection<Geometry> | null>(null);
  focusedObject = input<AnalysisObject | null>(null);
  objectSelect = output<AnalysisObject>();
  tileUrl = input('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  tileError = signal(false);
  boundaryError = signal(false);
  private http = inject(HttpClient);
  private boundaryRequest?: Subscription;
  private map?: Map;
  private markerOverlay?: Overlay;
  private markerAppearance?: Animation;
  private raster = new XYZ({
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attributions: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19, crossOrigin: 'anonymous'
  });
  private countryOutline = new VectorSource();
  private nearbySource = new VectorSource({ wrapX: false });
  private nearbyStyles = new globalThis.Map<string, Style[]>();
  private nearbyLayer = new VectorLayer({ source: this.nearbySource, declutter: true,
    renderOrder:(a,b) => Number(b.get('id') === this.focusedObject()?.id) - Number(a.get('id') === this.focusedObject()?.id) || Number(a.get('distanceMeters')) - Number(b.get('distanceMeters')),
    style: feature => this.nearbyStyle(feature) });
  private observer?: ResizeObserver;
  constructor() {
    effect(() => { this.selected(); this.drawSelection(); });
    effect(() => this.raster.setUrl(this.tileUrl()));
    effect(() => {
      const collection = this.nearbyFeatures();
      this.nearbySource.clear();
      if (collection) {
        const features = new GeoJSON().readFeatures(collection, {dataProjection:'EPSG:4326',featureProjection:'EPSG:3857'});
        for (const feature of features) {
          const geometry = feature.getGeometry();
          // Put the badge inside the actual area rather than at its nearest edge.
          const polygon = geometry instanceof MultiPolygon ? geometry.getPolygons().sort((a,b) => b.getArea()-a.getArea())[0] : geometry;
          const line = geometry instanceof MultiLineString ? geometry.getLineStrings().sort((a,b) => b.getLength()-a.getLength())[0] : geometry;
          const point = polygon instanceof Polygon ? new Point(polygon.getInteriorPoint().getCoordinates().slice(0,2))
            : line instanceof LineString ? new Point(line.getCoordinateAt(.5))
            : geometry instanceof Point ? geometry : new Point(fromLonLat(feature.get('coordinate')));
          feature.set('markerGeometry',point,true);
        }
        this.nearbySource.addFeatures(features);
      }
    });
    effect(() => {
      const item = this.focusedObject(); this.nearbyLayer.changed();
      if (item && this.map) {
        const view = this.map.getView();
        const marker = this.nearbySource.getFeatureById(item.id)?.get('markerGeometry') as Point | undefined;
        view.animate({center:marker?.getCoordinates() || fromLonLat(item.coordinate),zoom:Math.max(view.getZoom() || 15,16),duration:this.duration});
      }
    });
  }
  ngAfterViewInit() {
    // Separate canvases keep the background filter and country clipping from
    // affecting the border, marker, or each other. Both reuse one tile source.
    const background = new TileLayer({
      className: 'country-background', source: this.raster, preload: 0, visible: false
    });
    const countryTiles = new TileLayer({
      className: 'country-interior', source: this.raster, preload: 0
    });
    const clipStyle = new Style({ fill: new Fill({ color: '#000' }) });
    countryTiles.on('postrender', event => {
      const outline = this.countryOutline.getFeatures()[0];
      const context = event.context;
      if (!outline || !(context instanceof CanvasRenderingContext2D)) return;
      context.save();
      try {
        context.globalCompositeOperation = 'destination-in';
        getVectorContext(event).drawFeature(outline, clipStyle);
      } finally { context.restore(); }
    });
    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        background,
        countryTiles,
        new VectorLayer({ source: this.countryOutline, style: [
          new Style({ stroke: new Stroke({ color: 'rgba(255, 255, 255, 0.65)', width: 5 }) }),
          new Style({ stroke: new Stroke({ color: '#173f35', width: 3 }) })
        ] }),
        this.nearbyLayer
      ],
      view: new View({ center: fromLonLat(this.country().center), zoom: this.country().zoom, minZoom: 3, maxZoom: 19 }),
      controls: defaultControls({ zoom: false, rotate: false, attributionOptions: { collapsible: false } })
    });
    // Overlay positions its own container; animate only the SVG inside it so
    // the bottom tip stays at the same geographic coordinate in every frame.
    this.markerOverlay = new Overlay({
      element: this.propertyMarker.nativeElement,
      positioning: 'bottom-center',
      offset: [0, 0],
      stopEvent: false
    });
    this.map.addOverlay(this.markerOverlay);
    this.map.on('singleclick', event => {
      const feature = this.map?.forEachFeatureAtPixel(event.pixel, item => item, {layerFilter:layer => layer === this.nearbyLayer,hitTolerance:3});
      if (feature) {
        const {id,name,category,kind,distanceMeters,coordinate,osmUrl} = feature.getProperties();
        this.objectSelect.emit({id,name,category,kind,distanceMeters,coordinate,osmUrl});
      }
    });
    this.map.on('pointermove', event => {
      if (!this.map || event.dragging) return;
      this.mapElement.nativeElement.style.cursor = this.map.hasFeatureAtPixel(event.pixel,{layerFilter:layer => layer === this.nearbyLayer,hitTolerance:3}) ? 'pointer' : '';
    });
    this.raster.on('tileloaderror', () => this.tileError.set(true));
    this.observer = new ResizeObserver(() => this.map?.updateSize());
    this.observer.observe(this.mapElement.nativeElement);
    this.drawSelection();
    this.boundaryRequest = this.http.get<object>(`data/boundaries/${this.country().code.toLowerCase()}.osm.geojson`).subscribe({
      next: data => {
        try {
          const highlight = countryHighlight(data, this.country().code);
          this.countryOutline.addFeature(highlight.outline);
          countryTiles.setExtent(highlight.outline.getGeometry()!.getExtent());
          background.setVisible(true);
          countryTiles.changed();
          if (!this.selected()) this.map?.getView().fit(highlight.outline.getGeometry()!.getExtent(), {
            padding: [40, 70, 40, 40], maxZoom: 7
          });
        } catch { this.boundaryError.set(true); }
      },
      error: () => this.boundaryError.set(true)
    });
  }
  private nearbyStyle(feature: FeatureLike) {
    const category = String(feature.get('category')) as CategoryId;
    const active = feature.get('id') === this.focusedObject()?.id;
    const key = `${category}:${active}`;
    let style = this.nearbyStyles.get(key);
    if (!style) {
      const color = CATEGORY_MARKERS[category]?.color || '#173f35';
      style = [new Style({
        fill: new Fill({color:color + (active ? '26' : '0c')}),
        stroke: new Stroke({color:color + (active ? 'ff' : '88'),width:active ? 2.5 : 1.25}),
        zIndex: 0
      }),new Style({
        geometry: item => (item as Feature).get('markerGeometry'),
        image:new Icon({src:nearbyMarkerSvg(category,active),width:active ? 44 : 36,anchor:[.5,44/48],declutterMode:active ? 'obstacle' : 'declutter'}),
        zIndex:active ? 20 : 10
      })];
      this.nearbyStyles.set(key,style);
    }
    return style;
  }
  private drawSelection() {
    if (!this.map || !this.markerOverlay) return;
    this.markerAppearance?.cancel();
    const place = this.selected();
    if (!place) { this.markerOverlay.setPosition(undefined); return; }
    const coordinate = fromLonLat([place.longitude, place.latitude]);
    this.markerOverlay.setPosition(coordinate);
    if (this.duration) {
      this.markerAppearance = this.propertyPin.nativeElement.animate([
        { opacity: 0, transform: 'scale(.82)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    const view = this.map.getView();
    view.animate({ center: coordinate, zoom: Math.max(view.getZoom() || 14, 15), duration: this.duration });
  }
  private get duration() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350; }
  zoom(delta: number) { const view = this.map?.getView(); view?.animate({ zoom: (view.getZoom() || 13) + delta, duration: this.duration }); }
  ngOnDestroy() { this.markerAppearance?.cancel(); this.boundaryRequest?.unsubscribe(); this.observer?.disconnect(); this.map?.setTarget(undefined); this.map?.dispose(); }
}
