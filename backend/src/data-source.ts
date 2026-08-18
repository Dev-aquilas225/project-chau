import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { Order } from './orders/entities/order.entity';
import { OrderStatusHistory } from './orders/entities/order-status-history.entity';
import { Review } from './reviews/entities/review.entity';
import { UserReview } from './reviews/entities/user-review.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { PromoCode } from './promo-codes/entities/promo-code.entity';
import { PlatformConfig } from './platform-config/entities/platform-config.entity';
import { Role } from './roles/entities/role.entity';
import { Offer } from './offers/entities/offer.entity';
import { PayoutRequest } from './payouts/entities/payout-request.entity';
import { Notification } from './notifications/entities/notification.entity';
import { MagicLinkToken } from './auth/entities/magic-link-token.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'aquilas',
  entities: [User, Product, Category, Order, OrderStatusHistory, Review, UserReview, Favorite, PromoCode, PlatformConfig, Role, Offer, PayoutRequest, Notification, MagicLinkToken],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

