import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

const PAID_STATUSES: OrderStatus[] = ['paid', 'shipped', 'delivered'];
const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export type AnalyticsPeriod = '7d' | '30d' | '90d';

function periodToDays(period: AnalyticsPeriod): number {
  return { '7d': 7, '30d': 30, '90d': 90 }[period];
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDayBuckets(days: number): string[] {
  const buckets: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.push(dayKey(d));
  }
  return buckets;
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async getStats() {
    const [revenueRow, countsRaw, outOfStockCount, recentOrders, pendingSellerCount, activeSellerCount] =
      await Promise.all([
        this.ordersRepo
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.total), 0)', 'sum')
          .where('order.status IN (:...statuses)', { statuses: PAID_STATUSES })
          .getRawOne<{ sum: string }>(),
        this.ordersRepo
          .createQueryBuilder('order')
          .select('order.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('order.status')
          .getRawMany<{ status: OrderStatus; count: string }>(),
        this.productsRepo.count({ where: { stock: 0 } }),
        this.ordersRepo.find({ order: { createdAt: 'DESC' }, take: 5 }),
        this.usersRepo.count({ where: { sellerStatus: 'pending' } }),
        this.usersRepo.count({ where: { sellerStatus: 'approved', blocked: false } }),
      ]);

    const countsByStatus = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
    for (const row of countsRaw) {
      countsByStatus[row.status] = Number(row.count);
    }

    return {
      totalRevenue: Number(revenueRow?.sum ?? 0),
      ordersByStatus: countsByStatus,
      totalOrders: Object.values(countsByStatus).reduce((s, n) => s + n, 0),
      outOfStockProducts: outOfStockCount,
      recentOrders,
      pendingSellerCount,
      activeSellerCount,
    };
  }

  async getAnalytics(period: AnalyticsPeriod) {
    const days = periodToDays(period);
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [orders, sellers, customers] = await Promise.all([
      this.ordersRepo.find({ where: { createdAt: MoreThanOrEqual(since) } }),
      this.usersRepo.find({ where: { createdAt: MoreThanOrEqual(since) }, select: ['id', 'sellerStatus', 'sellerProfile', 'createdAt'] }),
      this.usersRepo.count({ where: { createdAt: MoreThanOrEqual(since) } }),
    ]);

    const buckets = buildDayBuckets(days);
    const revenueByDay = new Map(buckets.map((b) => [b, 0]));
    const userGrowthByDay = new Map(buckets.map((b) => [b, 0]));
    const sellerGrowthByDay = new Map(buckets.map((b) => [b, 0]));

    const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status));
    for (const order of paidOrders) {
      const key = dayKey(new Date(order.createdAt));
      if (revenueByDay.has(key)) revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(order.total));
    }

    for (const user of sellers) {
      const key = dayKey(new Date(user.createdAt));
      if (userGrowthByDay.has(key)) userGrowthByDay.set(key, (userGrowthByDay.get(key) ?? 0) + 1);
      if (user.sellerStatus !== 'none') {
        const submittedAt = user.sellerProfile?.submittedAt ? new Date(user.sellerProfile.submittedAt) : new Date(user.createdAt);
        const sellerKey = dayKey(submittedAt);
        if (sellerGrowthByDay.has(sellerKey)) sellerGrowthByDay.set(sellerKey, (sellerGrowthByDay.get(sellerKey) ?? 0) + 1);
      }
    }

    const productTotals = new Map<string, { name: string; unitsSold: number; revenue: number }>();
    const sellerTotals = new Map<string, { revenue: number; ordersCount: number }>();
    for (const order of paidOrders) {
      for (const item of order.items) {
        const entry = productTotals.get(item.productId) ?? { name: item.name, unitsSold: 0, revenue: 0 };
        entry.unitsSold += item.qty;
        entry.revenue += item.unitPrice * item.qty;
        productTotals.set(item.productId, entry);
      }
      if (order.sellerId) {
        const entry = sellerTotals.get(order.sellerId) ?? { revenue: 0, ordersCount: 0 };
        entry.revenue += Number(order.total);
        entry.ordersCount += 1;
        sellerTotals.set(order.sellerId, entry);
      }
    }

    const topProducts = [...productTotals.entries()]
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const sellerIds = [...sellerTotals.keys()];
    const sellerUsers = sellerIds.length
      ? await this.usersRepo.find({ where: { id: In(sellerIds) }, select: ['id', 'displayName'] })
      : [];
    const sellerNameById = new Map(sellerUsers.map((u) => [u.id, u.displayName]));
    const topSellers = [...sellerTotals.entries()]
      .map(([sellerId, v]) => ({ sellerId, name: sellerNameById.get(sellerId) ?? 'Vendeur', ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const avgOrderValue = paidOrders.length
      ? paidOrders.reduce((sum, o) => sum + Number(o.total), 0) / paidOrders.length
      : 0;
    const conversionRate = orders.length ? paidOrders.length / orders.length : 0;

    return {
      revenueTrend: buckets.map((date) => ({ date, revenue: Math.round((revenueByDay.get(date) ?? 0) * 100) / 100 })),
      userGrowth: buckets.map((date) => ({ date, newUsers: userGrowthByDay.get(date) ?? 0 })),
      sellerGrowth: buckets.map((date) => ({ date, newSellers: sellerGrowthByDay.get(date) ?? 0 })),
      topProducts,
      topSellers,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 1000) / 1000,
      newUsersCount: customers,
    };
  }
}
