import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findMine(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.findMine(user.sub);
  }

  @Post()
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(user.sub, dto.productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.favoritesService.remove(user.sub, productId);
  }
}
