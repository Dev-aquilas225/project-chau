import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { MagicLinkToken } from './entities/magic-link-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { welcomeTemplate, magicLinkTemplate } from '../mail/templates';

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
// Réponse générique systématique (aucune fuite d'existence de compte), cohérente avec
// login/register — verifyMagicLink crée le compte à la volée si besoin de toute façon.
const MAGIC_LINK_GENERIC_RESPONSE = { message: 'Si cette adresse est valide, un lien de connexion vient de vous être envoyé.' };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(MagicLinkToken) private magicLinkRepo: Repository<MagicLinkToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  private sanitize(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      sellerStatus: user.sellerStatus,
      sellerProfile: user.sellerProfile,
      addresses: user.addresses,
      photoURL: user.photoURL,
      bio: user.bio,
      country: user.country,
      city: user.city,
      blocked: user.blocked,
      customRole: user.customRole ? { id: user.customRole.id, name: user.customRole.name, permissions: user.customRole.permissions } : null,
      createdAt: user.createdAt,
    };
  }

  signToken(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      sellerStatus: user.sellerStatus,
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
      role: 'customer',
      addresses: [],
    });
    const saved = await this.usersRepo.save(user);
    const { subject, html } = welcomeTemplate(saved.displayName);
    await this.mailService.send({ to: saved.email, subject, html });
    return { accessToken: this.signToken(saved), user: this.sanitize(saved) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.customRole', 'customRole')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    if (user.blocked) throw new UnauthorizedException('Compte bloqué');

    return { accessToken: this.signToken(user), user: this.sanitize(user) };
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async requestMagicLink(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    await this.magicLinkRepo.save(
      this.magicLinkRepo.create({ email: normalizedEmail, tokenHash, expiresAt, usedAt: null }),
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const link = `${frontendUrl}/connexion-lien/${rawToken}`;
    const { subject, html } = magicLinkTemplate(link);
    await this.mailService.send({ to: normalizedEmail, subject, html });

    return MAGIC_LINK_GENERIC_RESPONSE;
  }

  async verifyMagicLink(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.magicLinkRepo.findOne({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Lien de connexion invalide ou expiré');
    }
    // Jeton à usage unique : marqué consommé avant même de créer/relire l'utilisateur,
    // pour qu'une double soumission concurrente ne puisse pas être rejouée.
    record.usedAt = new Date();
    await this.magicLinkRepo.save(record);

    let user = await this.usersRepo.findOne({ where: { email: record.email }, relations: ['customRole'] });
    if (!user) {
      // Première connexion via lien magique : création du compte à la volée, avec un
      // mot de passe aléatoire et inconnu (le compte ne pourra être ouvert que par
      // magic link tant qu'un mot de passe n'est pas explicitement défini ailleurs).
      const randomPasswordHash = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
      const created = this.usersRepo.create({
        email: record.email,
        displayName: record.email.split('@')[0],
        passwordHash: randomPasswordHash,
        role: 'customer',
        addresses: [],
      });
      user = await this.usersRepo.save(created);
      const { subject, html } = welcomeTemplate(user.displayName);
      await this.mailService.send({ to: user.email, subject, html });
    }

    if (user.blocked) throw new UnauthorizedException('Compte bloqué');

    return { accessToken: this.signToken(user), user: this.sanitize(user) };
  }

  async me(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['customRole'] });
    if (!user) throw new UnauthorizedException();
    return this.sanitize(user);
  }
}
