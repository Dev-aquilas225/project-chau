import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRequest } from './entities/payout-request.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePayoutDto, ReviewPayoutDto } from './dto/payout.dto';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(PayoutRequest) private payoutsRepo: Repository<PayoutRequest>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private notificationsService: NotificationsService
  ) {}

  async create(userId: string, dto: CreatePayoutDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    
    const balance = parseFloat(user.walletBalance as any) || 0;
    if (balance < dto.amount) {
      throw new BadRequestException('Solde insuffisant pour cette demande de retrait');
    }

    user.walletBalance = Math.round((balance - dto.amount) * 100) / 100;
    await this.usersRepo.save(user);

    const payout = this.payoutsRepo.create({
      userId,
      amount: dto.amount,
      status: 'pending',
    });

    const saved = await this.payoutsRepo.save(payout);

    await this.notificationsService.notifyAdmins(
      'new_seller_application',
      'Demande de retrait reçue',
      `Le vendeur "${user.sellerProfile?.storeName || user.displayName}" a demandé un virement de ${dto.amount.toFixed(2)} €.`,
      `/retraits/${saved.id}`,
    );

    return saved;
  }

  findMine(userId: string) {
    return this.payoutsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.payoutsRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async review(id: string, dto: ReviewPayoutDto) {
    const payout = await this.payoutsRepo.findOne({ where: { id }, relations: ['user'] });
    if (!payout) throw new NotFoundException('Demande de retrait introuvable');
    if (payout.status !== 'pending') throw new BadRequestException('Cette demande a déjà été traitée');

    payout.status = dto.status;
    payout.reviewNote = dto.reviewNote || null;
    const saved = await this.payoutsRepo.save(payout);

    const user = payout.user;

    if (dto.status === 'rejected') {
      const currentBalance = parseFloat(user.walletBalance as any) || 0;
      user.walletBalance = Math.round((currentBalance + parseFloat(payout.amount as any)) * 100) / 100;
      await this.usersRepo.save(user);

      await this.notificationsService.create(
        payout.userId,
        'seller_status',
        'Retrait refusé',
        `Votre demande de retrait de ${payout.amount} € a été refusée.${dto.reviewNote ? ` Motif : ${dto.reviewNote}` : ''} Le montant a été recrédité sur votre portefeuille.`,
        '/portefeuille',
      );
    } else {
      await this.notificationsService.create(
        payout.userId,
        'seller_status',
        'Virement envoyé !',
        `Votre demande de retrait de ${payout.amount} € a été validée. Le virement est en cours vers votre IBAN.`,
        '/portefeuille',
      );
    }

    return saved;
  }
}
