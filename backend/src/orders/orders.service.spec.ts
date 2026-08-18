import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let historyRepo: { create: jest.Mock; save: jest.Mock; find: jest.Mock };
  let productsRepo: { findOne: jest.Mock; save: jest.Mock };
  let usersRepo: { findOne: jest.Mock };
  let platformConfig: { getValue: jest.Mock };
  let notificationsService: { create: jest.Mock; notifyAdmins: jest.Mock };
  let promoCodesService: { validate: jest.Mock };
  let mailService: { send: jest.Mock };

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
    productsRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'p1', name: 'Produit', brand: '', images: [], price: 10, stock: 5, active: true, sellerId: null }),
      save: jest.fn(async (p) => p),
    };
    usersRepo = { findOne: jest.fn().mockResolvedValue({ id: 'user-1', email: 'buyer@test.com', displayName: 'Buyer' }) };
    platformConfig = { getValue: jest.fn().mockResolvedValue(10) };
    notificationsService = { create: jest.fn(), notifyAdmins: jest.fn() };
    promoCodesService = { validate: jest.fn() };
    mailService = { send: jest.fn().mockResolvedValue(undefined) };
    service = new OrdersService(
      repo as never,
      historyRepo as never,
      productsRepo as never,
      usersRepo as never,
      null as any,
      null as any,
      platformConfig as never,
      notificationsService as never,
      promoCodesService as never,
      mailService as never,
    );
  });

  it("crée une commande avec status 'pending' et le userId du token, et insère l'historique — le prix vient du produit en base, pas du client", async () => {
    const dto = {
      items: [{ productId: 'p1', name: 'Nom falsifié par le client', brand: '', image: '', unitPrice: 0.01, qty: 1 }],
      subtotal: 0.01,
      total: 0.01,
      shippingAddress: { fullName: 'A', line1: '1 rue', city: 'Paris', zip: '75000', country: 'France' },
      paymentMethod: 'card',
    };

    const result = await service.create('user-1', dto as never);

    expect(result.userId).toBe('user-1');
    expect(result.status).toBe('pending');
    expect(result.discount).toBe(0);
    // Le prix client (0.01) est ignoré : le total est recalculé depuis Product.price (10).
    expect(result.subtotal).toBe(10);
    expect(result.total).toBe(10);
    expect(result.items[0].unitPrice).toBe(10);
    expect(historyRepo.create).toHaveBeenCalledWith({ orderId: 'order-1', status: 'pending' });
    expect(historyRepo.save).toHaveBeenCalled();
    expect(mailService.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'buyer@test.com' }));
  });

  it('create rejette un produit en rupture de stock', async () => {
    productsRepo.findOne.mockResolvedValue({ id: 'p1', name: 'Produit', brand: '', images: [], price: 10, stock: 0, active: true, sellerId: null });
    const dto = {
      items: [{ productId: 'p1', name: 'Produit', brand: '', image: '', unitPrice: 10, qty: 1 }],
      subtotal: 10,
      total: 10,
      shippingAddress: { fullName: 'A', line1: '1 rue', city: 'Paris', zip: '75000', country: 'France' },
      paymentMethod: 'card',
    };
    await expect(service.create('user-1', dto as never)).rejects.toThrow('Stock insuffisant');
  });

  it('create rejette un produit désactivé', async () => {
    productsRepo.findOne.mockResolvedValue({ id: 'p1', name: 'Produit', brand: '', images: [], price: 10, stock: 5, active: false, sellerId: null });
    const dto = {
      items: [{ productId: 'p1', name: 'Produit', brand: '', image: '', unitPrice: 10, qty: 1 }],
      subtotal: 10,
      total: 10,
      shippingAddress: { fullName: 'A', line1: '1 rue', city: 'Paris', zip: '75000', country: 'France' },
      paymentMethod: 'card',
    };
    await expect(service.create('user-1', dto as never)).rejects.toThrow('indisponible');
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

  it("updateStatus envoie un email de mise à jour à l'acheteur", async () => {
    repo.findOne.mockResolvedValue({ id: 'order-1', userId: 'user-1', status: 'pending' });
    await service.updateStatus('order-1', 'shipped');
    expect(mailService.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'buyer@test.com' }));
  });

  it("updateStatus ne plante pas si l'acheteur n'existe plus (email simplement ignoré)", async () => {
    repo.findOne.mockResolvedValue({ id: 'order-1', userId: 'user-1', status: 'pending' });
    usersRepo.findOne.mockResolvedValue(null);
    const result = await service.updateStatus('order-1', 'shipped');
    expect(result.status).toBe('shipped');
    expect(mailService.send).not.toHaveBeenCalled();
  });
});
