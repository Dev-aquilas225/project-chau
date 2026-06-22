import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, SellerStatus } from '../users/entities/user.entity';
import { ApplySellerDto, UpdateSellerProfileDto, UpdateSellerStatusDto } from './dto/seller.dto';

@Injectable()
export class SellersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  private sanitizeSeller(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      sellerStatus: user.sellerStatus,
      sellerProfile: user.sellerProfile,
      createdAt: user.createdAt,
    };
  }

  async apply(userId: string, dto: ApplySellerDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.sellerStatus !== 'none') {
      throw new BadRequestException(
        user.sellerStatus === 'pending'
          ? 'Candidature déjà en attente'
          : user.sellerStatus === 'approved'
            ? 'Compte vendeur déjà approuvé'
            : 'Candidature rejetée — contactez le support',
      );
    }
    user.sellerStatus = 'pending';
    user.sellerProfile = { storeName: dto.storeName, bio: dto.bio ?? '' };
    return this.sanitizeSeller(await this.usersRepo.save(user));
  }

  async getMyProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitizeSeller(user);
  }

  async updateMyProfile(userId: string, dto: UpdateSellerProfileDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.sellerStatus !== 'approved') throw new ForbiddenException('Compte vendeur approuvé requis');
    user.sellerProfile = { ...user.sellerProfile, ...dto };
    return this.sanitizeSeller(await this.usersRepo.save(user));
  }

  async listSellers(status?: SellerStatus) {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where("user.sellerStatus != 'none'");
    if (status) qb.andWhere('user.sellerStatus = :status', { status });
    qb.orderBy('user.createdAt', 'DESC');
    const users = await qb.getMany();
    return users.map((u) => this.sanitizeSeller(u));
  }

  async updateStatus(targetUserId: string, dto: UpdateSellerStatusDto) {
    const user = await this.usersRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.sellerStatus === 'none') throw new BadRequestException("Cet utilisateur n'a pas soumis de candidature");
    user.sellerStatus = dto.status;
    return this.sanitizeSeller(await this.usersRepo.save(user));
  }
}
