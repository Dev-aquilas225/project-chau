import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { CreateShippingZoneDto, UpdateShippingZoneDto } from './dto/shipping-zone.dto';

@Injectable()
export class ShippingZonesService {
  constructor(
    @InjectRepository(ShippingZone)
    private readonly repo: Repository<ShippingZone>,
  ) {}

  /** Toutes les zones (admin — actives + inactives) */
  findAll(): Promise<ShippingZone[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  /** Zones actives uniquement (public — pour le checkout) */
  findActive(): Promise<ShippingZone[]> {
    return this.repo.find({ where: { active: true }, order: { sortOrder: 'ASC' } });
  }

  /**
   * Trouve la zone de livraison applicable pour un code pays ISO 3166-1 alpha-2.
   * Priorité : zone spécifique au pays > zone globale (countryCodes vide).
   */
  async findForCountry(countryCode: string): Promise<ShippingZone | null> {
    const code = countryCode.toUpperCase();
    const activeZones = await this.findActive();

    // 1. Chercher une zone dont countryCodes contient ce pays
    const specific = activeZones.find(
      (z) => Array.isArray(z.countryCodes) && z.countryCodes.includes(code),
    );
    if (specific) return specific;

    // 2. Fallback : zone globale (countryCodes vide)
    const fallback = activeZones.find(
      (z) => Array.isArray(z.countryCodes) && z.countryCodes.length === 0,
    );
    return fallback ?? null;
  }

  /**
   * Calcule le coût de livraison pour une zone et un total de commande.
   * Retourne 0 si le seuil de gratuité est atteint.
   */
  calculateFee(zone: ShippingZone, orderTotal: number): number {
    if (zone.freeThreshold !== null && orderTotal >= zone.freeThreshold) {
      return 0;
    }
    return Number(zone.basePrice);
  }

  async findOne(id: string): Promise<ShippingZone> {
    const zone = await this.repo.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Zone de livraison introuvable');
    return zone;
  }

  async create(dto: CreateShippingZoneDto): Promise<ShippingZone> {
    const zone = this.repo.create({
      ...dto,
      freeThreshold: dto.freeThreshold ?? null,
      active: dto.active ?? true,
      sortOrder: dto.sortOrder ?? 99,
    });
    return this.repo.save(zone);
  }

  async update(id: string, dto: UpdateShippingZoneDto): Promise<ShippingZone> {
    const zone = await this.findOne(id);
    Object.assign(zone, dto);
    return this.repo.save(zone);
  }

  async remove(id: string): Promise<void> {
    const zone = await this.findOne(id);
    await this.repo.remove(zone);
  }
}
