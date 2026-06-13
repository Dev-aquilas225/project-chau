import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidatePromoCodeDto } from './dto/promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(@InjectRepository(PromoCode) private promoRepo: Repository<PromoCode>) {}

  findAll() {
    return this.promoRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Code promo introuvable');
    return promo;
  }

  create(dto: CreatePromoCodeDto) {
    const promo = this.promoRepo.create({
      ...dto,
      code: dto.code.toUpperCase().trim(),
      minAmount: dto.minAmount ?? 0,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      active: dto.active ?? true,
    });
    return this.promoRepo.save(promo);
  }

  async update(id: string, dto: UpdatePromoCodeDto) {
    const promo = await this.findOne(id);
    Object.assign(promo, {
      ...dto,
      code: dto.code ? dto.code.toUpperCase().trim() : promo.code,
      expiresAt: dto.expiresAt !== undefined ? (dto.expiresAt ? new Date(dto.expiresAt) : null) : promo.expiresAt,
    });
    return this.promoRepo.save(promo);
  }

  async remove(id: string) {
    const promo = await this.findOne(id);
    await this.promoRepo.remove(promo);
    return { deleted: true };
  }

  /** Valide un code promo et renvoie le code + la remise calculée. Source de vérité serveur. */
  async validate(dto: ValidatePromoCodeDto) {
    const promo = await this.promoRepo.findOne({ where: { code: dto.code.toUpperCase().trim() } });
    if (!promo || !promo.active) {
      throw new BadRequestException('Code promo invalide');
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      throw new BadRequestException('Code promo expiré');
    }
    if (Number(promo.minAmount) > dto.subtotal) {
      throw new BadRequestException(`Montant minimum de ${promo.minAmount} requis pour ce code`);
    }

    const discount =
      promo.discountType === 'percentage'
        ? Math.min((dto.subtotal * Number(promo.discountValue)) / 100, dto.subtotal)
        : Math.min(Number(promo.discountValue), dto.subtotal);

    return {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      discount,
      total: Math.max(0, dto.subtotal - discount),
    };
  }
}
