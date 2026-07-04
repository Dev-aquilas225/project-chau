import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderStatusHistory, Product]), PlatformConfigModule, NotificationsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
