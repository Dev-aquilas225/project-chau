import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product])],
  providers: [AdminDashboardService],
  controllers: [AdminDashboardController],
})
export class AdminDashboardModule {}
