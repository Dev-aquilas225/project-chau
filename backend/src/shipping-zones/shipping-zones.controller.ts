import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ShippingZonesService } from './shipping-zones.service';
import { CreateShippingZoneDto, UpdateShippingZoneDto } from './dto/shipping-zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('shipping-zones')
export class ShippingZonesController {
  constructor(private readonly service: ShippingZonesService) {}

  /** Public — zones actives (utilisé par le checkout frontend) */
  @Get()
  findActive() {
    return this.service.findActive();
  }

  /** Public — zone applicable pour un pays donné */
  @Get('for-country/:code')
  findForCountry(@Param('code') code: string) {
    return this.service.findForCountry(code);
  }

  /** Admin — toutes les zones (actives + inactives) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  /** Admin — créer une zone */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateShippingZoneDto) {
    return this.service.create(dto);
  }

  /** Admin — modifier une zone */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShippingZoneDto) {
    return this.service.update(id, dto);
  }

  /** Admin — supprimer une zone */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
