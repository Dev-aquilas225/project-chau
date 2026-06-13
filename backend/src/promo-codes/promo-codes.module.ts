import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode])],
  providers: [PromoCodesService],
  controllers: [PromoCodesController],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}
