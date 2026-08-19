import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';

function resolveCorsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  if (configured && configured.trim() !== '') {
    return configured
      .split(',')
      .map((o) => o.trim().replace(/\/+$/, '')) // le header Origin du navigateur n'a jamais de slash final
      .filter(Boolean);
  }
  // Défaut restrictif (dev uniquement) : les ports Vite des deux SPA locales.
  // En production, CORS_ORIGINS doit toujours être positionné explicitement.
  return ['http://localhost:5173', 'http://localhost:5174'];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const corsOrigins = resolveCorsOrigins();
  if (!process.env.CORS_ORIGINS) {
    Logger.warn(
      `CORS_ORIGINS non défini — repli sur les origines de dev (${corsOrigins.join(', ')}). À positionner explicitement en production.`,
      'Bootstrap',
    );
  }
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.use(
    helmet({
      // Static assets (/uploads) doivent rester chargeables cross-origin par les deux SPA.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  // process.cwd() (pas __dirname) : multer écrit aussi ses fichiers relativement au cwd,
  // et __dirname diffère entre dev (src/) et prod (dist/src/), désynchronisant lecture/écriture.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
