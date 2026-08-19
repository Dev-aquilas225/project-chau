import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { NotificationsModule } from './notifications/notifications.module';
import { RolesModule } from './roles/roles.module';
import { StripeModule } from './stripe/stripe.module';
import { OffersModule } from './offers/offers.module';
import { PayoutsModule } from './payouts/payouts.module';
import { MailModule } from './mail/mail.module';
import { User } from './users/entities/user.entity';
import { MagicLinkToken } from './auth/entities/magic-link-token.entity';
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
import { HttpLoggerMiddleware } from './common/http-logger.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Limite globale par défaut (générale) ; des limites plus strictes sont appliquées
    // via @Throttle() sur les routes sensibles (login/register) pour contrer le brute-force.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    MailModule,
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
        entities: [User, Product, Category, Order, OrderStatusHistory, Review, UserReview, Favorite, PromoCode, PlatformConfig, Role, Offer, PayoutRequest, Notification, MagicLinkToken],
        synchronize: false,
        autoLoadEntities: true,
        migrationsRun: true,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
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
    NotificationsModule,
    RolesModule,
    StripeModule,
    OffersModule,
    PayoutsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
