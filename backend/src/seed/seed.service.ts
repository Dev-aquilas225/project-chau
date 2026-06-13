import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin1234';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  /** Crée l'utilisateur admin par défaut s'il n'existe pas déjà (idempotent). */
  async seedAdmin() {
    const existing = await this.usersRepo.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      return;
    }
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = this.usersRepo.create({
      email: ADMIN_EMAIL,
      displayName: 'Administrateur',
      passwordHash,
      role: 'admin',
      addresses: [],
    });
    await this.usersRepo.save(admin);
    this.logger.log(`Admin par défaut créé : ${ADMIN_EMAIL}`);
  }
}
