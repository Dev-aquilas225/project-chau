import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';

describe('PromoCodesService', () => {
  let service: PromoCodesService;
  let repo: { find: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn(async (d) => ({ id: 'promo-1', ...d })),
      remove: jest.fn(),
    };
    service = new PromoCodesService(repo as never);
  });

  describe('create', () => {
    it('normalise le code en majuscules et applique les valeurs par défaut', async () => {
      const result = await service.create({ code: ' soldes20 ', discountType: 'percentage', discountValue: 20 });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'SOLDES20', minAmount: 0, active: true, expiresAt: null }),
      );
      expect(result.id).toBe('promo-1');
    });
  });

  describe('findOne', () => {
    it('lève NotFoundException si absent', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validate', () => {
    it('refuse un code inconnu', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.validate({ code: 'NOPE', subtotal: 100 })).rejects.toThrow(BadRequestException);
    });

    it('refuse un code inactif', async () => {
      repo.findOne.mockResolvedValue({ code: 'OFF', active: false, minAmount: 0 });
      await expect(service.validate({ code: 'OFF', subtotal: 100 })).rejects.toThrow(BadRequestException);
    });

    it('refuse un code expiré', async () => {
      repo.findOne.mockResolvedValue({ code: 'OLD', active: true, minAmount: 0, expiresAt: new Date('2000-01-01') });
      await expect(service.validate({ code: 'OLD', subtotal: 100 })).rejects.toThrow(BadRequestException);
    });

    it('refuse si le sous-total est inférieur au minimum requis', async () => {
      repo.findOne.mockResolvedValue({ code: 'MIN50', active: true, minAmount: 50, expiresAt: null });
      await expect(service.validate({ code: 'MIN50', subtotal: 10 })).rejects.toThrow(BadRequestException);
    });

    it('calcule une remise en pourcentage', async () => {
      repo.findOne.mockResolvedValue({ code: 'PCT20', active: true, minAmount: 0, expiresAt: null, discountType: 'percentage', discountValue: 20 });
      const result = await service.validate({ code: 'PCT20', subtotal: 100 });
      expect(result.discount).toBe(20);
      expect(result.total).toBe(80);
    });

    it('calcule une remise fixe plafonnée au sous-total', async () => {
      repo.findOne.mockResolvedValue({ code: 'FIX50', active: true, minAmount: 0, expiresAt: null, discountType: 'fixed', discountValue: 50 });
      const result = await service.validate({ code: 'FIX50', subtotal: 30 });
      expect(result.discount).toBe(30);
      expect(result.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('supprime un code promo existant', async () => {
      repo.findOne.mockResolvedValue({ id: 'promo-1' });
      const result = await service.remove('promo-1');
      expect(repo.remove).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
