import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { ApplySellerDto, UpdateSellerBlockDto, UpdateSellerProfileDto, UpdateSellerStatusDto } from './dto/seller.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
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

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('sellers', 'view_any')
  @Get()
  listSellers(@Query('status') status?: SellerStatus) {
    return this.sellersService.listSellers(status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('sellers', 'update')
  @Patch(':userId/status')
  updateStatus(@Param('userId') userId: string, @Body() dto: UpdateSellerStatusDto) {
    return this.sellersService.updateStatus(userId, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('sellers', 'update')
  @Patch(':userId/block')
  setBlocked(@Param('userId') userId: string, @Body() dto: UpdateSellerBlockDto) {
    return this.sellersService.setBlocked(userId, dto);
  }
}
