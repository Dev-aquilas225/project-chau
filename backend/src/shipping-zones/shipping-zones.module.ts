import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingZonesService } from './shipping-zones.service';
import { ShippingZonesController } from './shipping-zones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingZone])],
  controllers: [ShippingZonesController],
  providers: [ShippingZonesService],
  exports: [ShippingZonesService],
})
export class ShippingZonesModule {}
