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

  /**
   * Crée l'utilisateur admin par défaut une seule fois, à la toute première
   * initialisation (idempotent). Ne touche plus jamais un compte déjà existant :
   * réécrire passwordHash/role à chaque redémarrage réinitialiserait silencieusement
   * le mot de passe d'un admin qui l'aurait changé depuis, vers une valeur connue
   * et présente dans le code source.
   */
  async seedAdmin() {
    try {
      const existing = await this.usersRepo.findOne({ where: { email: ADMIN_EMAIL } });
      if (existing) {
        return;
      }

      if (!process.env.ADMIN_PASSWORD) {
        this.logger.warn(
          `ADMIN_PASSWORD non défini — création de l'admin par défaut avec le mot de passe de convenance ` +
            `documenté dans le repo. À changer immédiatement après la première connexion, ou à définir ` +
            `explicitement via la variable d'environnement ADMIN_PASSWORD avant le premier démarrage.`,
        );
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
    } catch (err) {
      this.logger.error('Failed to seed admin', err);
    }
  }
}
