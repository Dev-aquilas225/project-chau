import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { ApplySellerDto, UpdateSellerProfileDto, UpdateSellerStatusDto } from './dto/seller.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { SellerStatus } from '../users/entities/user.entity';

@Controller('sellers')
export class SellersController {
  constructor(private sellersService: SellersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(@CurrentUser() user: JwtPayload, @Body() dto: ApplySellerDto) {
    return this.sellersService.apply(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.sellersService.getMyProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSellerProfileDto) {
    return this.sellersService.updateMyProfile(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  listSellers(@Query('status') status?: SellerStatus) {
    return this.sellersService.listSellers(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':userId/status')
  updateStatus(@Param('userId') userId: string, @Body() dto: UpdateSellerStatusDto) {
    return this.sellersService.updateStatus(userId, dto);
  }
}
