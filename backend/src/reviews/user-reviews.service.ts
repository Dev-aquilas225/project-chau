import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReview } from './entities/user-review.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserReviewsService {
  constructor(
    @InjectRepository(UserReview) private userReviewsRepo: Repository<UserReview>,
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(User) private usersRepo: Repository<User>
  ) {}

  async findByUser(userId: string) {
    const reviews = await this.userReviewsRepo.find({
      where: { revieweeId: userId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });

    const items = reviews.map((r) => ({
      id: r.id,
      reviewerId: r.reviewerId,
      reviewerName: r.reviewer?.displayName ?? 'Utilisateur',
      reviewerPhoto: r.reviewer?.photoURL ?? null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    const count = items.length;
    const average = count === 0 ? 0 : items.reduce((s, r) => s + r.rating, 0) / count;
    return { items, average, count };
  }

  async create(reviewerId: string, revieweeId: string, dto: { rating: number; comment?: string; orderId: string }) {
    const order = await this.ordersRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Commande introuvable');

    if (order.userId !== reviewerId && order.sellerId !== reviewerId) {
      throw new BadRequestException('Vous devez être partie prenante de la commande pour laisser un avis');
    }

    if (order.userId !== revieweeId && order.sellerId !== revieweeId) {
      throw new BadRequestException('L\'utilisateur évalué doit faire partie de la commande');
    }

    const existing = await this.userReviewsRepo.findOne({
      where: { orderId: dto.orderId, reviewerId }
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà laissé un avis pour cette commande');
    }

    const review = this.userReviewsRepo.create({
      reviewerId,
      revieweeId,
      orderId: dto.orderId,
      rating: dto.rating,
      comment: dto.comment ?? '',
    });

    return this.userReviewsRepo.save(review);
  }
}
