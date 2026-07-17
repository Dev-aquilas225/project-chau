import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeModule } from '../stripe/stripe.module';
import { Offer } from '../offers/entities/offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderStatusHistory, Product, User, Offer]),
    PlatformConfigModule,
    NotificationsModule,
    forwardRef(() => StripeModule),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
