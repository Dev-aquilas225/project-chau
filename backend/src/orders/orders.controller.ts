import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { hasPermission } from '../auth/permissions.util';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { OrderStatus } from './entities/order.entity';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.sub, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.ordersService.findMine(user.sub);
  }

  @UseGuards(SellerGuard)
  @Get('seller')
  findSeller(@CurrentUser() user: JwtPayload) {
    return this.ordersService.findSeller(user.sub);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('orders', 'view')
  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (order.userId !== user.sub && order.sellerId !== user.sub && !hasPermission(user, 'orders', 'view')) {
      throw new ForbiddenException();
    }
    return order;
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('orders', 'manage')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status, dto.note);
  }
}
