import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import { User, SellerStatus } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplySellerDto, UpdateSellerBlockDto, UpdateSellerProfileDto, UpdateSellerStatusDto } from './dto/seller.dto';

const IDENTITY_UPLOAD_DIR = join(process.cwd(), 'uploads-private', 'identity');

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private authService: AuthService,
    private notificationsService: NotificationsService,
  ) {}

  private baseView(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      sellerStatus: user.sellerStatus,
      identityVerified: user.sellerStatus === 'approved',
      blocked: user.blocked,
      blockedAt: user.blockedAt,
      blockReason: user.blockReason,
      createdAt: user.createdAt,
    };
  }

  private sanitizeSelf(user: User) {
    return {
      ...this.baseView(user),
      sellerProfile: {
        storeName: user.sellerProfile?.storeName,
        bio: user.sellerProfile?.bio,
        iban: user.sellerProfile?.iban,
        reviewNote: user.sellerProfile?.reviewNote,
        reviewedAt: user.sellerProfile?.reviewedAt,
      },
    };
  }

  private sanitizeAdmin(user: User) {
    return {
      ...this.baseView(user),
      sellerProfile: {
        storeName: user.sellerProfile?.storeName,
        bio: user.sellerProfile?.bio,
        iban: user.sellerProfile?.iban,
        idType: user.sellerProfile?.idType,
        idNumber: user.sellerProfile?.idNumber,
        idCountry: user.sellerProfile?.idCountry,
        fullNameOnId: user.sellerProfile?.fullNameOnId,
        dateOfBirth: user.sellerProfile?.dateOfBirth,
        idDocumentRef: user.sellerProfile?.idDocumentRef,
        idDocumentBackRef: user.sellerProfile?.idDocumentBackRef,
        profilePhotoRef: user.sellerProfile?.profilePhotoRef,
        submittedAt: user.sellerProfile?.submittedAt,
        reviewNote: user.sellerProfile?.reviewNote,
        reviewedAt: user.sellerProfile?.reviewedAt,
      },
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

    const refsToValidate = [dto.idDocumentRef, dto.profilePhotoRef];
    if (dto.idType === 'national_id') refsToValidate.push(dto.idDocumentBackRef as string);
    for (const ref of refsToValidate) {
      const safeRef = ref.includes('/') || ref.includes('\\') ? '' : ref;
      if (!safeRef || !safeRef.startsWith(`${userId}-`) || !existsSync(join(IDENTITY_UPLOAD_DIR, safeRef))) {
        throw new BadRequestException('Document invalide ou manquant');
      }
    }

    const now = new Date().toISOString();
    user.sellerStatus = 'pending';
    user.sellerProfile = {
      storeName: dto.storeName,
      bio: dto.bio ?? '',
      idType: dto.idType,
      idNumber: dto.idNumber,
      idCountry: dto.idCountry,
      fullNameOnId: dto.fullNameOnId,
      dateOfBirth: dto.dateOfBirth,
      idDocumentRef: dto.idDocumentRef,
      idDocumentBackRef: dto.idType === 'national_id' ? dto.idDocumentBackRef : undefined,
      profilePhotoRef: dto.profilePhotoRef,
      submittedAt: now,
    };
    const saved = await this.usersRepo.save(user);
    await this.notificationsService.notifyAdmins(
      'new_seller_application',
      'Nouvelle candidature vendeur',
      `${dto.storeName} a soumis une demande de vérification`,
      `/vendeurs/${saved.id}`,
    );
    return { accessToken: this.authService.signToken(saved), user: this.sanitizeSelf(saved) };
  }

  async getMyProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitizeSelf(user);
  }

  async updateMyProfile(userId: string, dto: UpdateSellerProfileDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.sellerStatus !== 'approved') throw new ForbiddenException('Compte vendeur approuvé requis');
    user.sellerProfile = { ...user.sellerProfile, ...dto };
    return this.sanitizeSelf(await this.usersRepo.save(user));
  }

  async listSellers(status?: SellerStatus) {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where("user.sellerStatus != 'none'");
    if (status) qb.andWhere('user.sellerStatus = :status', { status });
    qb.orderBy('user.createdAt', 'DESC');
    const users = await qb.getMany();
    return users.map((u) => this.sanitizeAdmin(u));
  }

  async updateStatus(targetUserId: string, dto: UpdateSellerStatusDto) {
    const user = await this.usersRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.sellerStatus === 'none') throw new BadRequestException("Cet utilisateur n'a pas soumis de candidature");
    const now = new Date().toISOString();
    user.sellerStatus = dto.status;
    user.sellerProfile = {
      ...user.sellerProfile,
      reviewNote: dto.note?.trim() || undefined,
      reviewedAt: now,
      ...(dto.status === 'approved' ? { verifiedAt: now } : {}),
    };
    const saved = await this.usersRepo.save(user);

    const message =
      dto.status === 'approved'
        ? 'Votre compte vendeur a été approuvé, vous pouvez vendre !'
        : `Votre candidature vendeur a été rejetée.${dto.note ? ` Motif : ${dto.note}` : ''}`;
    await this.notificationsService.create(
      targetUserId,
      'seller_status',
      "Vérification d'identité",
      message,
      dto.status === 'approved' ? '/espace-vendeur' : '/devenir-vendeur',
    );

    return this.sanitizeAdmin(saved);
  }

  async setBlocked(targetUserId: string, dto: UpdateSellerBlockDto) {
    const user = await this.usersRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.sellerStatus === 'none') {
      throw new BadRequestException("Cet utilisateur n'a pas de profil vendeur");
    }

    user.blocked = dto.blocked;
    user.blockedAt = dto.blocked ? new Date() : null;
    user.blockReason = dto.blocked ? dto.reason?.trim() || null : null;
    const saved = await this.usersRepo.save(user);

    await this.notificationsService.create(
      targetUserId,
      'seller_status',
      dto.blocked ? 'Compte suspendu' : 'Compte réactivé',
      dto.blocked
        ? `Votre compte vendeur a été suspendu.${dto.reason ? ` Motif : ${dto.reason}` : ''}`
        : 'Votre compte vendeur a été réactivé.',
      '/espace-vendeur',
    );

    return this.sanitizeAdmin(saved);
  }
}
