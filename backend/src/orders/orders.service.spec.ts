import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };

  beforeEach(() => {
    repo = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (o) => ({ id: 'order-1', ...o })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    service = new OrdersService(repo as never);
  });

  it("crée une commande avec status 'pending' et le userId du token", async () => {
    const dto = {
      items: [{ productId: 'p1', name: 'Produit', brand: '', image: '', unitPrice: 10, qty: 1 }],
      subtotal: 10,
      total: 10,
      shippingAddress: { fullName: 'A', line1: '1 rue', city: 'Paris', zip: '75000', country: 'France' },
      paymentMethod: 'card',
    };

    const result = await service.create('user-1', dto as never);

    expect(result.userId).toBe('user-1');
    expect(result.status).toBe('pending');
    expect(result.discount).toBe(0);
  });

  it('findOne lève NotFoundException si absent', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('updateStatus change le statut', async () => {
    repo.findOne.mockResolvedValue({ id: 'order-1', status: 'pending' });
    const result = await service.updateStatus('order-1', 'paid');
    expect(result.status).toBe('paid');
  });
});
