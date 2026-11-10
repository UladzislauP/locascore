import type { CategoryAnalysis } from './service';
import type { CategoryId } from './categories';

export type FactorId = 'green' | 'daily' | 'transport' | 'health' | 'education';
export interface AccessibilityRating {
  version: 'osm-accessibility-v1'; status: 'preliminary' | 'insufficient_data'; score: number | null;
  factors: { id: FactorId; weight: number; score: number | null; contribution: number | null;
    components: { category: CategoryId; distanceMeters: number | null; fullPointsWithinMeters: number; score: number | null }[] }[];
}
// Product heuristics, not a validated housing/health/education quality model.
// Each category uses its nearest mapped facility: counts never inflate scores.
const FACTORS: {id: FactorId; weight: number; categories: [CategoryId, number][]}[] = [
  {id:'green',weight:25,categories:[['parks',200]]},
  {id:'daily',weight:25,categories:[['groceries',300]]},
  {id:'transport',weight:25,categories:[['transport',300]]},
  {id:'health',weight:15,categories:[['pharmacies',500]]},
  {id:'education',weight:10,categories:[['schools',500],['kindergartens',500]]}
];
export function accessibilityRating(categories: CategoryAnalysis[]): AccessibilityRating {
  const factors = FACTORS.map(factor => {
    const components = factor.categories.map(([id, good]) => {
      const category = categories.find(item => item.id === id);
      const valid = category && (category.status === 'available' || category.status === 'not_found');
      const distance = category?.nearest?.distanceMeters ?? null;
      const score = !valid ? null : distance === null ? 0 : Math.max(0, Math.min(100, 100 * (1000 - distance) / (1000 - good)));
      return {category:id,distanceMeters:distance,fullPointsWithinMeters:good,score};
    });
    const score = components.some(item => item.score === null) ? null : components.reduce((sum,item) => sum + item.score!,0) / components.length;
    return {id:factor.id,weight:factor.weight,score,contribution:score === null ? null : score * factor.weight / 100,components};
  });
  const incomplete = factors.some(item => item.score === null) || !factors.some(item => item.components.some(part => part.distanceMeters !== null));
  return {version:'osm-accessibility-v1',status:incomplete ? 'insufficient_data' : 'preliminary',
    score:incomplete ? null : Math.round(factors.reduce((sum,item) => sum + item.contribution!,0)),factors};
}
