import { Component, input } from '@angular/core';

export const ICON_PATHS: Record<string, string> = {
  playground: 'M3 21V4h18v17 M3 6h18 M9 6v10 M15 6v10 M7 16h10v3H7v-3Z',
  water: 'M12 2C9 7 4 11 4 15a8 8 0 0 0 16 0c0-4-5-8-8-13Z M8 15a4 4 0 0 0 4 4',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  layers: 'M12 3 2 8l10 5 10-5-10-5Z M2 12l10 5 10-5 M2 16l10 5 10-5',
  tree: 'm12 2-7 9h4l-5 6h6v5h4v-5h6l-5-6h4l-7-9Z',
  train: 'M7 3h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z M5 11h14 M8 15h1 M15 15h1 M8 19l-2 3 M16 19l2 3 M9 3V1h6v2',
  shop: 'M3 10v11h18V10 M2 10l2-7h16l2 7 M2 10h20 M9 21v-7h6v7',
  sound: 'M11 4 6 8H2v8h4l5 4V4Z M15 8a6 6 0 0 1 0 8 M18 4a11 11 0 0 1 0 16',
  school: 'm2 8 10-5 10 5-10 5L2 8Z M5 10v7c4 4 10 4 14 0v-7 M22 8v9',
  health: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z',
  target: 'M12 1v5 M12 18v5 M1 12h5 M18 12h5 M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  moon: 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',
  sun: 'M12 2V0 M12 24v-2 M2 12H0 M24 12h-2 M5 5 3 3 M21 21l-2-2 M5 19l-2 2 M21 3l-2 2 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  compare: 'M3 3h7v18H3V3Z M14 7h7v14h-7V7Z',
  close: 'm6 6 12 12 M18 6 6 18',
  plus: 'M12 5v14 M5 12h14', minus: 'M5 12h14',
  info: 'M12 11v6 M12 7v.1 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  check: 'm5 12 4 4L19 6', chevron: 'm6 14 6-6 6 6',
  compass: 'm16 8-2 6-6 2 2-6 6-2Z M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'
};
@Component({
  selector: 'app-icon',
  template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path"/></svg>',
  styles: [':host{display:inline-flex;width:22px;height:22px;flex:none}svg{width:100%;height:100%}']
})
export class IconComponent {
  name = input('pin');
  get path() { return ICON_PATHS[this.name()] || ICON_PATHS['pin']; }
}
