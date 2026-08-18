import { ConfigService } from '@nestjs/config';

const INSECURE_DEFAULTS = new Set(['change-me-in-production', 'secret', 'changeme', '']);

/**
 * Lit JWT_SECRET depuis l'environnement et fait échouer le démarrage si absent/trop
 * faible, plutôt que de retomber silencieusement sur une valeur connue (committée
 * dans .env.example) qui permettrait de forger des tokens admin valides.
 */
export function requireJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || INSECURE_DEFAULTS.has(secret) || secret.length < 16) {
    throw new Error(
      'JWT_SECRET est manquant ou trop faible. Positionne une valeur secrète et aléatoire ' +
        '(>= 16 caractères) dans backend/.env avant de démarrer l\'application.',
    );
  }
  return secret;
}
