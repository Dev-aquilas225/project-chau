import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private gateway: NotificationsGateway,
  ) {}

  async create(userId: string, type: NotificationType, title: string, message: string, link?: string) {
    const notification = this.notificationsRepo.create({ userId, type, title, message, link: link ?? null });
    const saved = await this.notificationsRepo.save(notification);
    this.gateway.emitToUser(userId, saved);
    return saved;
  }

  /** Notifie tous les admins natifs + tout utilisateur disposant d'un rôle personnalisé (staff délégué). */
  async notifyAdmins(type: NotificationType, title: string, message: string, link?: string) {
    const recipients = await this.usersRepo.find({
      where: [{ role: 'admin' }, { customRoleId: Not(IsNull()) }],
      select: ['id'],
    });
    const rows = await this.notificationsRepo.save(
      recipients.map((r) => this.notificationsRepo.create({ userId: r.id, type, title, message, link: link ?? null })),
    );
    for (const row of rows) this.gateway.emitToUser(row.userId, row);
    return rows;
  }

  findMine(userId: string) {
    return this.notificationsRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 });
  }

  unreadCount(userId: string) {
    return this.notificationsRepo.count({ where: { userId, read: false } });
  }

  async markRead(id: string, userId: string) {
    await this.notificationsRepo.update({ id, userId }, { read: true });
    return { updated: true };
  }

  async markAllRead(userId: string) {
    await this.notificationsRepo.update({ userId, read: false }, { read: true });
    return { updated: true };
  }
}
