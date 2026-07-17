import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private stripeClient: any = null;
  private webhookSecret: string = '';
  private isMockMode = true;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const mode = this.configService.get<string>('STRIPE_MODE', 'dev');
    const secretKey = mode === 'prod' 
      ? this.configService.get<string>('STRIPE_SECRET_KEY_PROD')
      : this.configService.get<string>('STRIPE_SECRET_KEY_DEV');

    this.webhookSecret = mode === 'prod'
      ? this.configService.get<string>('STRIPE_WEBHOOK_SECRET_PROD', '')
      : this.configService.get<string>('STRIPE_WEBHOOK_SECRET_DEV', '');

    if (secretKey && secretKey !== 'sk_test_mock' && secretKey.startsWith('sk_')) {
      try {
        // Dynamically import Stripe to prevent crash if not fully installed yet
        const Stripe = require('stripe');
        this.stripeClient = new Stripe(secretKey, {
          apiVersion: '2023-10-16', // Standard stable version
        });
        this.isMockMode = false;
        this.logger.log(`Stripe initialisé avec succès en mode ${mode.toUpperCase()} (Réel).`);
      } catch (err) {
        this.logger.error(`Erreur d'initialisation Stripe, passage en mode MOCK: ${(err as any).message}`);
        this.isMockMode = true;
      }
    } else {
      this.logger.warn('Aucune clé Stripe valide fournie. Le système fonctionnera en mode MOCK.');
      this.isMockMode = true;
    }
  }

  getIsMockMode(): boolean {
    return this.isMockMode;
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
    if (this.isMockMode) {
      const mockId = `pi_mock_${Math.random().toString(36).substring(2, 11)}`;
      return {
        id: mockId,
        clientSecret: `${mockId}_secret_${Math.random().toString(36).substring(2, 11)}`,
        amount,
        currency,
        isMock: true,
      };
    }

    try {
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // En centimes
        currency: currency.toLowerCase(),
        metadata,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        isMock: false,
      };
    } catch (err) {
      this.logger.error(`Erreur Stripe lors du createPaymentIntent: ${(err as any).message}`);
      throw err;
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string) {
    if (this.isMockMode) {
      // Mock validation
      try {
        const parsed = JSON.parse(rawBody);
        return parsed;
      } catch {
        return null;
      }
    }

    try {
      return this.stripeClient.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
    } catch (err) {
      this.logger.error(`Erreur de validation de signature Webhook Stripe: ${(err as any).message}`);
      return null;
    }
  }
}
