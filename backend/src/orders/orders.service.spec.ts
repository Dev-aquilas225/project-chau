import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let historyRepo: { create: jest.Mock; save: jest.Mock; find: jest.Mock };
  let productsRepo: { findOne: jest.Mock };
  let platformConfig: { getValue: jest.Mock };
  let notificationsService: { create: jest.Mock; notifyAdmins: jest.Mock };

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
    productsRepo = { findOne: jest.fn().mockResolvedValue({ sellerId: null }) };
    platformConfig = { getValue: jest.fn().mockResolvedValue(10) };
    notificationsService = { create: jest.fn(), notifyAdmins: jest.fn() };
    service = new OrdersService(
      repo as never,
      historyRepo as never,
      productsRepo as never,
      null as any,
      null as any,
      null as any,
      platformConfig as never,
      notificationsService as never,
    );
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
    repo.findOne.mockResolvedValue({ id: 'order-1', userId: 'user-1', status: 'pending' });
    const result = await service.updateStatus('order-1', 'shipped', 'Expédié via Colissimo');
    expect(result.status).toBe('shipped');
    expect(historyRepo.create).toHaveBeenCalledWith({ orderId: 'order-1', status: 'shipped', note: 'Expédié via Colissimo' });
  });

  it('updateStatus notifie l\'acheteur (order.userId) du changement de statut', async () => {
    repo.findOne.mockResolvedValue({ id: 'order-1', userId: 'user-1', status: 'pending' });
    await service.updateStatus('order-1', 'shipped');
    expect(notificationsService.create).toHaveBeenCalledWith(
      'user-1',
      'order_status',
      'Commande mise à jour',
      expect.stringContaining('Expédiée'),
      '/commandes',
    );
  });

  it('updateStatus lève NotFoundException si absent', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.updateStatus('missing', 'paid')).rejects.toThrow(NotFoundException);
  });
});
