import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Product } from '../products/entities/product.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private notificationsService: NotificationsService
  ) {}

  async create(buyerId: string, dto: CreateOfferDto) {
    const product = await this.productsRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (!product.active) throw new BadRequestException('Ce produit n\'est plus en vente');
    if (product.sellerId === buyerId) throw new BadRequestException('Vous ne pouvez pas faire une offre sur votre propre produit');

    // Check if a pending offer already exists
    const existing = await this.offersRepo.findOne({
      where: { productId: dto.productId, buyerId, status: 'pending' }
    });
    if (existing) {
      existing.suggestedPrice = dto.suggestedPrice;
      return this.offersRepo.save(existing);
    }

    const offer = this.offersRepo.create({
      productId: dto.productId,
      buyerId,
      sellerId: product.sellerId || '',
      suggestedPrice: dto.suggestedPrice,
      status: 'pending',
    });

    const saved = await this.offersRepo.save(offer);

    // Notify seller
    if (product.sellerId) {
      await this.notificationsService.create(
        product.sellerId,
        'new_order', // notification type
        'Nouvelle offre de prix',
        `Une offre de ${dto.suggestedPrice.toFixed(2)} € a été soumise pour "${product.name}".`,
        '/offres',
      );
    }

    return saved;
  }

  findMine(buyerId: string) {
    return this.offersRepo.find({
      where: { buyerId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  findSeller(sellerId: string) {
    return this.offersRepo.find({
      where: { sellerId },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' },
    });
  }

  async accept(id: string, sellerId: string) {
    const offer = await this.offersRepo.findOne({ where: { id }, relations: ['product'] });
    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.sellerId !== sellerId) throw new BadRequestException('Vous n\'êtes pas autorisé à accepter cette offre');
    if (offer.status !== 'pending') throw new BadRequestException('L\'offre n\'est plus en attente');

    offer.status = 'accepted';
    const saved = await this.offersRepo.save(offer);

    // Notify buyer
    await this.notificationsService.create(
      offer.buyerId,
      'order_status',
      'Offre acceptée !',
      `Votre offre de ${offer.suggestedPrice.toFixed(2)} € pour "${offer.product.name}" a été acceptée.`,
      '/offres',
    );

    return saved;
  }

  async decline(id: string, sellerId: string) {
    const offer = await this.offersRepo.findOne({ where: { id }, relations: ['product'] });
    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.sellerId !== sellerId) throw new BadRequestException('Vous n\'êtes pas autorisé à refuser cette offre');
    if (offer.status !== 'pending') throw new BadRequestException('L\'offre n\'est plus en attente');

    offer.status = 'declined';
    const saved = await this.offersRepo.save(offer);

    // Notify buyer
    await this.notificationsService.create(
      offer.buyerId,
      'order_status',
      'Offre refusée',
      `Votre offre pour "${offer.product.name}" a été refusée.`,
      '/offres',
    );

    return saved;
  }
}
