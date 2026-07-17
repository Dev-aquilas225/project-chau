import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user.sub, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.offersService.findMine(user.sub);
  }

  @UseGuards(SellerGuard)
  @Get('seller')
  findSeller(@CurrentUser() user: JwtPayload) {
    return this.offersService.findSeller(user.sub);
  }

  @Patch(':id/accept')
  accept(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.offersService.accept(id, user.sub);
  }

  @Patch(':id/decline')
  decline(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.offersService.decline(id, user.sub);
  }
}
