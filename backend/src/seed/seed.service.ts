import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'priscillenkengue94@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '88888888eE@!';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  /** Crée ou met à jour l'utilisateur admin par défaut (idempotent). */
  async seedAdmin() {
    try {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const existing = await this.usersRepo.findOne({ where: { email: ADMIN_EMAIL } });

      if (existing) {
        existing.passwordHash = passwordHash;
        existing.role = 'admin';
        await this.usersRepo.save(existing);
        this.logger.log(`Admin par défaut mis à jour : ${ADMIN_EMAIL}`);
        return;
      }

      const admin = this.usersRepo.create({
        email: ADMIN_EMAIL,
        displayName: 'Administrateur',
        passwordHash,
        role: 'admin',
        addresses: [],
      });
      await this.usersRepo.save(admin);
      this.logger.log(`Admin par défaut créé : ${ADMIN_EMAIL}`);
    } catch (err) {
      this.logger.error('Failed to seed admin', err);
    }
  }
}
