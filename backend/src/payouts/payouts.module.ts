import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutRequest } from './entities/payout-request.entity';
import { User } from '../users/entities/user.entity';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([PayoutRequest, User]), NotificationsModule],
  providers: [PayoutsService],
  controllers: [PayoutsController],
  exports: [PayoutsService],
})
export class PayoutsModule {}
