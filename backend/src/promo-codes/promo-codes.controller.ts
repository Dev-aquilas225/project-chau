import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidatePromoCodeDto } from './dto/promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private promoCodesService: PromoCodesService) {}

  @Post('validate')
  validate(@Body() dto: ValidatePromoCodeDto) {
    return this.promoCodesService.validate(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('promoCodes', 'view_any')
  @Get()
  findAll() {
    return this.promoCodesService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('promoCodes', 'create')
  @Post()
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('promoCodes', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.promoCodesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('promoCodes', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promoCodesService.remove(id);
  }
}
