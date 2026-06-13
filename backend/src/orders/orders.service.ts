import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private ordersRepo: Repository<Order>) {}

  create(userId: string, dto: CreateOrderDto) {
    const order = this.ordersRepo.create({
      ...dto,
      discount: dto.discount ?? 0,
      userId,
      status: 'pending',
    });
    return this.ordersRepo.save(order);
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
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepo.save(order);
  }
}
