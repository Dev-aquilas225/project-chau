import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderStatusHistory) private historyRepo: Repository<OrderStatusHistory>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const order = this.ordersRepo.create({
      ...dto,
      discount: dto.discount ?? 0,
      userId,
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
