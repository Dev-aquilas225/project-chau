import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SellersService],
  controllers: [SellersController],
  exports: [SellersService],
})
export class SellersModule {}
