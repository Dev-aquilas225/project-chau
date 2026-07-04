import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notificationsRepo: Repository<Notification>) {}

  create(userId: string, type: NotificationType, title: string, message: string, link?: string) {
    const notification = this.notificationsRepo.create({ userId, type, title, message, link: link ?? null });
    return this.notificationsRepo.save(notification);
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
