import type { Promo } from '@/types';

/**
 * TODO : module `promos` non encore migré côté backend NestJS (hors scope v1, voir CLAUDE.md).
 * Ces fonctions sont des stubs pour ne pas casser le build de l'UI existante.
 */
export async function listPromos(): Promise<Promo[]> {
  return [];
}

export type PromoInput = Omit<Promo, 'id' | 'usedCount'>;

export async function upsertPromo(_input: PromoInput): Promise<void> {
  throw new Error('Module promos non disponible.');
}

export async function deletePromo(_id: string): Promise<void> {
  throw new Error('Module promos non disponible.');
}
