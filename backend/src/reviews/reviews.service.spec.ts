import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepo: { find: jest.Mock; create: jest.Mock; save: jest.Mock };
  let productsRepo: { findOne: jest.Mock };

  beforeEach(() => {
    reviewsRepo = { find: jest.fn(), create: jest.fn((d) => d), save: jest.fn(async (d) => ({ id: 'rev-1', ...d })) };
    productsRepo = { findOne: jest.fn() };
    service = new ReviewsService(reviewsRepo as never, productsRepo as never);
  });

  describe('findByProduct', () => {
    it('renvoie une liste vide et une moyenne de 0 sans avis', async () => {
      reviewsRepo.find.mockResolvedValue([]);
      const result = await service.findByProduct('prod-1');
      expect(result).toEqual({ items: [], average: 0, count: 0 });
    });

    it('calcule la moyenne et mappe le nom utilisateur', async () => {
      reviewsRepo.find.mockResolvedValue([
        { id: 'r1', userId: 'u1', productId: 'prod-1', rating: 4, comment: 'Top', createdAt: new Date(), user: { displayName: 'Alice' } },
        { id: 'r2', userId: 'u2', productId: 'prod-1', rating: 2, comment: '', createdAt: new Date(), user: { displayName: 'Bob' } },
      ]);
      const result = await service.findByProduct('prod-1');
      expect(result.count).toBe(2);
      expect(result.average).toBe(3);
      expect(result.items[0].userName).toBe('Alice');
    });
  });

  describe('create', () => {
    it('refuse si le produit est introuvable', async () => {
      productsRepo.findOne.mockResolvedValue(null);
      await expect(service.create('u1', 'prod-1', { rating: 5 })).rejects.toThrow(NotFoundException);
    });

    it('crée un avis avec rating et comment par défaut vide', async () => {
      productsRepo.findOne.mockResolvedValue({ id: 'prod-1' });
      const result = await service.create('u1', 'prod-1', { rating: 5 });
      expect(reviewsRepo.create).toHaveBeenCalledWith({ userId: 'u1', productId: 'prod-1', rating: 5, comment: '' });
      expect(result.id).toBe('rev-1');
    });
  });
});
