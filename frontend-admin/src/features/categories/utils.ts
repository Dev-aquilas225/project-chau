import type { Category } from '@/types';

export interface CategoryTreeNode extends Category {
  depth: number;
}

/** Aplatit l'arbre de catégories en respectant l'ordre hiérarchique (racine puis enfants), avec la profondeur de chaque nœud. */
export function flattenCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parent?.id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.name.localeCompare(b.name));

  const result: CategoryTreeNode[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const c of byParent.get(parentId) ?? []) {
      result.push({ ...c, depth });
      visit(c.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}
