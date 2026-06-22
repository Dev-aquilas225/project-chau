import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let ordersRepo: { createQueryBuilder: jest.Mock; find: jest.Mock };
  let productsRepo: { count: jest.Mock };
  let usersRepo: { count: jest.Mock };

  beforeEach(() => {
    ordersRepo = { createQueryBuilder: jest.fn(), find: jest.fn() };
    productsRepo = { count: jest.fn() };
    usersRepo = { count: jest.fn() };
    service = new AdminDashboardService(ordersRepo as never, productsRepo as never, usersRepo as never);
  });

  it('agrège chiffre d\'affaires, commandes par statut, rupture de stock et commandes récentes', async () => {
    const revenueQb = { select: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ sum: '150.00' }) };
    const statusQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ status: 'paid', count: '3' }, { status: 'pending', count: '1' }]),
    };
    ordersRepo.createQueryBuilder.mockReturnValueOnce(revenueQb).mockReturnValueOnce(statusQb);
    productsRepo.count.mockResolvedValue(2);
    ordersRepo.find.mockResolvedValue([{ id: 'o1' }]);
    usersRepo.count.mockResolvedValue(0);

    const result = await service.getStats();

    expect(result.totalRevenue).toBe(150);
    expect(result.ordersByStatus.paid).toBe(3);
    expect(result.ordersByStatus.pending).toBe(1);
    expect(result.ordersByStatus.cancelled).toBe(0);
    expect(result.totalOrders).toBe(4);
    expect(result.outOfStockProducts).toBe(2);
    expect(result.recentOrders).toEqual([{ id: 'o1' }]);
  });
});
