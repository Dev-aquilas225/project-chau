import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private categoriesRepo: Repository<Category>) {}

  findAll() {
    return this.categoriesRepo.find({ relations: ['parent'] });
  }

  async findOne(id: string) {
    const category = await this.categoriesRepo.findOne({ where: { id }, relations: ['parent'] });
    if (!category) throw new NotFoundException('Catégorie introuvable');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoriesRepo.create({
      name: dto.name,
      slug: dto.slug,
      parent: dto.parentId ? ({ id: dto.parentId } as Category) : null,
    });
    return this.categoriesRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.parentId !== undefined) category.parent = { id: dto.parentId } as Category;
    return this.categoriesRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoriesRepo.remove(category);
    return { deleted: true };
  }
}
