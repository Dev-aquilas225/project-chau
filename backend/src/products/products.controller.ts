import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductFiltersDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { hasPermission } from '../auth/permissions.util';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: ProductFiltersDto) {
    return this.productsService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('products', 'view_any')
  @Get('admin/all')
  listAll() {
    return this.productsService.listAll();
  }

  @UseGuards(JwtAuthGuard, SellerGuard)
  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.productsService.findMine(user.sub);
  }

  @Get('by-ids')
  findByIds(@Query('ids') ids: string) {
    const list = ids ? ids.split(',').filter(Boolean) : [];
    return this.productsService.findByIds(list);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProductDto) {
    if (user.sellerStatus !== 'approved' && !hasPermission(user, 'products', 'create')) {
      throw new ForbiddenException('Compte vendeur approuvé ou permission "products: create" requise');
    }
    return this.productsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productsService.remove(id, user);
  }
}
