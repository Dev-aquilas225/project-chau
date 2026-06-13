import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private favoritesRepo: Repository<Favorite>) {}

  async findMine(userId: string) {
    const favs = await this.favoritesRepo.find({ where: { userId } });
    return favs.map((f) => f.productId);
  }

  async add(userId: string, productId: string) {
    const existing = await this.favoritesRepo.findOne({ where: { userId, productId } });
    if (existing) return existing;
    const fav = this.favoritesRepo.create({ userId, productId });
    return this.favoritesRepo.save(fav);
  }

  async remove(userId: string, productId: string) {
    await this.favoritesRepo.delete({ userId, productId });
    return { deleted: true };
  }
}
