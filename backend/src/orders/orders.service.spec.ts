import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let historyRepo: { create: jest.Mock; save: jest.Mock; find: jest.Mock };

  beforeEach(() => {
    repo = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (o) => ({ id: 'order-1', ...o })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    historyRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (o) => ({ id: 'hist-1', ...o })),
      find: jest.fn(async () => []),
    };
    service = new OrdersService(repo as never, historyRepo as never);
  });

  it("crée une commande avec status 'pending' et le userId du token, et insère l'historique", async () => {
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
    expect(historyRepo.create).toHaveBeenCalledWith({ orderId: 'order-1', status: 'pending' });
    expect(historyRepo.save).toHaveBeenCalled();
  });

  it('findOne lève NotFoundException si absent', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('findOne retourne statusHistory trié', async () => {
    repo.findOne.mockResolvedValue({ id: 'order-1', status: 'paid' });
    const history = [{ id: 'h1', status: 'pending' }, { id: 'h2', status: 'paid' }];
    historyRepo.find.mockResolvedValue(history);

    const result = await service.findOne('order-1');

    expect(result.statusHistory).toEqual(history);
    expect(historyRepo.find).toHaveBeenCalledWith({
      where: { orderId: 'order-1' },
      order: { createdAt: 'ASC' },
    });
  });

  it('updateStatus change le statut et ajoute une entrée d\'historique avec note', async () => {
    repo.findOne.mockResolvedValue({ id: 'order-1', status: 'pending' });
    const result = await service.updateStatus('order-1', 'shipped', 'Expédié via Colissimo');
    expect(result.status).toBe('shipped');
    expect(historyRepo.create).toHaveBeenCalledWith({ orderId: 'order-1', status: 'shipped', note: 'Expédié via Colissimo' });
  });

  it('updateStatus lève NotFoundException si absent', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.updateStatus('missing', 'paid')).rejects.toThrow(NotFoundException);
  });
});
