import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto, ReviewPayoutDto } from './dto/payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('payouts')
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePayoutDto) {
    return this.payoutsService.create(user.sub, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.payoutsService.findMine(user.sub);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'view_any') // standard admin permission
  @Get()
  findAll() {
    return this.payoutsService.findAll();
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'update') // standard admin permission
  @Patch(':id/review')
  review(@Param('id') id: string, @Body() dto: ReviewPayoutDto) {
    return this.payoutsService.review(id, dto);
  }
}
