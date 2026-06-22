import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { AdminDashboardModule } from './admin/admin-dashboard.module';
import { SeedModule } from './seed/seed.module';
import { SellersModule } from './sellers/sellers.module';
import { PlatformConfigModule } from './platform-config/platform-config.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { Order } from './orders/entities/order.entity';
import { Review } from './reviews/entities/review.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { PromoCode } from './promo-codes/entities/promo-code.entity';
import { PlatformConfig } from './platform-config/entities/platform-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'aquilas'),
        entities: [User, Product, Category, Order, Review, Favorite, PromoCode, PlatformConfig],
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UploadsModule,
    ReviewsModule,
    FavoritesModule,
    PromoCodesModule,
    AdminDashboardModule,
    SeedModule,
    SellersModule,
    PlatformConfigModule,
  ],
})
export class AppModule {}
