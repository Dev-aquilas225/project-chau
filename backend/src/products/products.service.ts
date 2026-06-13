import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, ProductFiltersDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productsRepo: Repository<Product>) {}

  async findAll(filters: ProductFiltersDto = {}): Promise<Product[]> {
    const qb = this.productsRepo.createQueryBuilder('product').where('product.active = :active', { active: true });

    if (filters.category) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: filters.category });
    }
    if (filters.minPrice != null) {
      qb.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice != null) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.search) {
      qb.andWhere('(LOWER(product.name) LIKE :search OR LOWER(product.brand) LIKE :search)', {
        search: `%${filters.search.toLowerCase()}%`,
      });
    }

    if (filters.sort === 'price-asc') qb.orderBy('product.price', 'ASC');
    else if (filters.sort === 'price-desc') qb.orderBy('product.price', 'DESC');
    else qb.orderBy('product.createdAt', 'DESC');

    return qb.getMany();
  }

  /** Tous les produits (actifs ou non) — usage admin. */
  listAll(): Promise<Product[]> {
    return this.productsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return this.productsRepo.find({ where: { id: In(ids) } });
  }

  create(dto: CreateProductDto) {
    const product = this.productsRepo.create({ ...dto, categoryId: dto.categoryId ?? null });
    return this.productsRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productsRepo.remove(product);
    return { deleted: true };
  }
}
