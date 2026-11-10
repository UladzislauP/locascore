import { ICON_PATHS } from './icon.component';
import type { CategoryId } from './models';

export const CATEGORY_MARKERS: Record<CategoryId, {icon: string; color: string}> = {
  parks:{icon:'tree',color:'#327454'}, water:{icon:'water',color:'#28769c'},
  schools:{icon:'school',color:'#a96b28'}, kindergartens:{icon:'playground',color:'#aa5f7a'},
  groceries:{icon:'shop',color:'#75579b'}, pharmacies:{icon:'health',color:'#b4545e'},
  transport:{icon:'train',color:'#496b9c'}
};
/** Vector badges with built-in shadow padding; tip is at (20,44). */
export function nearbyMarkerSvg(category: CategoryId, active: boolean): string {
  const marker = CATEGORY_MARKERS[category] || {icon:'pin',color:'#173f35'};
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <defs><filter id="s" x="-40%" y="-30%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#173f35" flood-opacity=".25"/></filter></defs>
    <path d="M12 4h16a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-2l-6 8-6-8h-2a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z" fill="${marker.color}" stroke="white" stroke-width="${active ? 3 : 2.5}" stroke-linejoin="round" filter="url(#s)"/>
    <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON_PATHS[marker.icon]}"/></svg>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
