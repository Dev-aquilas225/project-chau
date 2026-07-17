import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.enableCors();
  // process.cwd() (pas __dirname) : multer écrit aussi ses fichiers relativement au cwd,
  // et __dirname diffère entre dev (src/) et prod (dist/src/), désynchronisant lecture/écriture.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
