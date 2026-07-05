import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, ProductFiltersDto, UpdateProductDto } from './dto/product.dto';
import { hasPermission } from '../auth/permissions.util';
import { NotificationsService } from '../notifications/notifications.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(filters: ProductFiltersDto = {}): Promise<Product[]> {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .where('product.active = :active', { active: true })
      .andWhere("product.listingStatus = 'active'");

    if (filters.category) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: filters.category });
    }
    if (filters.sellerId) {
      qb.andWhere('product.sellerId = :sellerId', { sellerId: filters.sellerId });
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

  listAll(): Promise<Product[]> {
    return this.productsRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['seller'],
    });
  }

  findMine(sellerId: string): Promise<Product[]> {
    return this.productsRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id }, relations: ['seller'] });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return this.productsRepo.find({ where: { id: In(ids) } });
  }

  create(dto: CreateProductDto, caller: JwtPayload) {
    const isStaff = hasPermission(caller, 'products', 'manage');
    const product = this.productsRepo.create({
      ...dto,
      categoryId: dto.categoryId ?? null,
      sellerId: isStaff ? null : caller.sub,
      listingStatus: 'active',
    });
    return this.productsRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto, caller: JwtPayload) {
    const product = await this.findOne(id);
    this.assertOwnerOrAdmin(product, caller);
    const wasOutOfStock = product.stock === 0;
    Object.assign(product, dto);
    const saved = await this.productsRepo.save(product);
    if (dto.stock === 0 && !wasOutOfStock) {
      await this.notificationsService.notifyAdmins(
        'low_stock',
        'Rupture de stock',
        `"${saved.name}" est en rupture de stock`,
        `/produits/${saved.id}`,
      );
    }
    return saved;
  }

  async remove(id: string, caller: JwtPayload) {
    const product = await this.findOne(id);
    this.assertOwnerOrAdmin(product, caller);
    if (hasPermission(caller, 'products', 'manage')) {
      await this.productsRepo.remove(product);
      return { deleted: true };
    }
    // Sellers archive instead of hard delete
    product.listingStatus = 'archived';
    await this.productsRepo.save(product);
    return { archived: true };
  }

  private assertOwnerOrAdmin(product: Product, caller: JwtPayload) {
    if (hasPermission(caller, 'products', 'manage')) return;
    if (product.sellerId !== caller.sub) throw new ForbiddenException('Accès refusé');
  }
}
