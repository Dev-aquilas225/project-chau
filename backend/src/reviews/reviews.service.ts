import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  async findByProduct(productId: string) {
    const reviews = await this.reviewsRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    const items = reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user?.displayName ?? 'Utilisateur',
      productId: r.productId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
    const count = items.length;
    const average = count === 0 ? 0 : items.reduce((s, r) => s + r.rating, 0) / count;
    return { items, average, count };
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');

    const review = this.reviewsRepo.create({
      userId,
      productId,
      rating: dto.rating,
      comment: dto.comment ?? '',
    });
    return this.reviewsRepo.save(review);
  }
}
