import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoi d'emails transactionnels via SMTP. Suit la même convention que StripeService :
 * si aucune config SMTP n'est fournie, le service journalise et n'envoie rien (mode
 * silencieux pratique en dev) plutôt que de faire planter le démarrage — contrairement
 * à JWT_SECRET, l'email n'est jamais critique pour la sécurité, seulement pour l'UX.
 * Un échec d'envoi ne doit JAMAIS faire échouer l'action métier déclenchante (inscription,
 * commande, etc.) : sendMail() catch systématiquement ses propres erreurs.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from = 'no-reply@localhost';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');
    this.from = this.configService.get<string>('SMTP_FROM') || user || 'no-reply@localhost';

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP_HOST/SMTP_USER/SMTP_PASSWORD non configurés — les emails transactionnels seront journalisés mais pas envoyés.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: { user, pass },
    });
    this.logger.log(`SMTP configuré (${host}:${port}) — envoi des emails transactionnels activé.`);
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`[email non envoyé, SMTP absent] to=${message.to} subject="${message.subject}"`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to: message.to, subject: message.subject, html: message.html });
    } catch (err) {
      // Ne jamais laisser un échec d'envoi remonter et casser le flux métier appelant.
      this.logger.error(`Échec d'envoi de l'email à ${message.to} : ${(err as Error).message}`);
    }
  }
}
