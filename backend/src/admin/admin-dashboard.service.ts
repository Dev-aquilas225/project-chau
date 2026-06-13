import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

const PAID_STATUSES: OrderStatus[] = ['paid', 'shipped', 'delivered'];
const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  async getStats() {
    const [revenueRow, countsRaw, outOfStockCount, recentOrders] = await Promise.all([
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
    };
  }
}
