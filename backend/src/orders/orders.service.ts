import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { PlatformConfigService } from '../platform-config/platform-config.service';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderStatusHistory) private historyRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private platformConfig: PlatformConfigService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const commissionRate = await this.platformConfig.getValue('commissionRate');

    // Extract sellerId from the first product in the order
    let sellerId: string | null = null;
    if (dto.items.length > 0) {
      const firstProduct = await this.productsRepo.findOne({ where: { id: dto.items[0].productId } });
      sellerId = firstProduct?.sellerId ?? null;
    }

    const total = dto.total;
    const platformFee = sellerId ? Math.round((total * commissionRate) / 100 * 100) / 100 : 0;
    const sellerPayout = sellerId ? Math.round((total - platformFee) * 100) / 100 : 0;

    const order = this.ordersRepo.create({
      ...dto,
      discount: dto.discount ?? 0,
      userId,
      sellerId,
      platformFee,
      sellerPayout,
      payoutStatus: 'pending',
      status: 'pending',
    });
    const saved = await this.ordersRepo.save(order);
    await this.historyRepo.save(this.historyRepo.create({ orderId: saved.id, status: 'pending' }));
    return saved;
  }

  findMine(userId: string) {
    return this.ordersRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  findAll(status?: OrderStatus) {
    return this.ordersRepo.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  findSeller(sellerId: string) {
    return this.ordersRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    const statusHistory = await this.historyRepo.find({
      where: { orderId: id },
      order: { createdAt: 'ASC' },
    });
    return { ...order, statusHistory };
  }

  async updateStatus(id: string, status: OrderStatus, note?: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.status = status;
    const saved = await this.ordersRepo.save(order);
    await this.historyRepo.save(this.historyRepo.create({ orderId: id, status, note: note ?? null }));
    return saved;
  }
}
