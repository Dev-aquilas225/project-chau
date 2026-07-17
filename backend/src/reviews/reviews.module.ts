import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UserReview } from './entities/user-review.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';
import { UserReviewsService } from './user-reviews.service';
import { ReviewsController } from './reviews.controller';
import { UserReviewsController } from './user-reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, UserReview, Product, Order, User])],
  providers: [ReviewsService, UserReviewsService],
  controllers: [ReviewsController, UserReviewsController],
  exports: [ReviewsService, UserReviewsService],
})
export class ReviewsModule {}
