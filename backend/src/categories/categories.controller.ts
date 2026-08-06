import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('onlyActive') onlyActive?: string) {
    const isOnlyActive = onlyActive === 'true' || onlyActive === '1';
    return this.categoriesService.findAll(isOnlyActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('categories', 'create')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('categories', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('categories', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
