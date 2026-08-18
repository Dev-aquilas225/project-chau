import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { basename, join } from 'path';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { detectImageType } from './image-signature';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const IDENTITY_UPLOAD_DIR = join(process.cwd(), 'uploads-private', 'identity');
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Le fileFilter Multer ne voit que le mimetype déclaré par le client (falsifiable) —
// il sert juste à rejeter tôt les cas évidents. La validation qui compte (magic bytes)
// se fait après réception complète du buffer, dans chaque handler.
export function mimeFileFilter(_req: unknown, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    cb(new BadRequestException('Type de fichier non autorisé'), false);
    return;
  }
  cb(null, true);
}

/**
 * Valide le contenu réel du buffer (magic bytes) et l'écrit sur disque sous un nom
 * généré serveur avec l'extension correspondant au type détecté — jamais le nom ou
 * l'extension fournis par le client.
 */
async function persistValidatedImage(file: Express.Multer.File | undefined, destDir: string, baseName: string): Promise<string> {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new BadRequestException('Aucun fichier transmis ou format/taille non valide');
  }
  const detected = detectImageType(file.buffer);
  if (!detected) {
    throw new BadRequestException('Le contenu du fichier ne correspond à aucun format image autorisé (JPEG, PNG, WEBP, GIF)');
  }
  mkdirSync(destDir, { recursive: true });
  const filename = `${baseName}${detected.ext}`;
  await writeFile(join(destDir, filename), file.buffer);
  return filename;
}

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: mimeFileFilter,
    }),
  )
  async uploadProductImage(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    // Autorisation vérifiée AVANT toute écriture sur disque (audit sécurité : un
    // fichier était auparavant écrit puis exposé publiquement même en cas de refus).
    if (user.role !== 'admin' && user.sellerStatus !== 'approved') {
      throw new ForbiddenException('Compte vendeur approuvé ou rôle admin requis');
    }
    const dir = join(process.cwd(), 'uploads', 'products');
    const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = await persistValidatedImage(file, dir, baseName);
    return { url: `/uploads/products/${filename}` };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: mimeFileFilter,
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    const dir = join(process.cwd(), 'uploads', 'avatars');
    const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = await persistValidatedImage(file, dir, baseName);
    return { url: `/uploads/avatars/${filename}` };
  }

  @Post('identity/id-document')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_FILE_SIZE }, fileFilter: mimeFileFilter }))
  async uploadIdDocument(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const baseName = `${user.sub}-id-document-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = await persistValidatedImage(file, IDENTITY_UPLOAD_DIR, baseName);
    return { ref: filename };
  }

  @Post('identity/id-document-back')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_FILE_SIZE }, fileFilter: mimeFileFilter }))
  async uploadIdDocumentBack(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const baseName = `${user.sub}-id-document-back-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = await persistValidatedImage(file, IDENTITY_UPLOAD_DIR, baseName);
    return { ref: filename };
  }

  @Post('identity/profile-photo')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_FILE_SIZE }, fileFilter: mimeFileFilter }))
  async uploadProfilePhoto(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const baseName = `${user.sub}-profile-photo-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = await persistValidatedImage(file, IDENTITY_UPLOAD_DIR, baseName);
    return { ref: filename };
  }

  @Get('identity/:filename')
  getIdentityFile(@CurrentUser() user: JwtPayload, @Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = basename(filename);
    if (safeFilename !== filename) {
      throw new ForbiddenException('Nom de fichier invalide');
    }
    if (!safeFilename.startsWith(`${user.sub}-`) && user.role !== 'admin') {
      throw new ForbiddenException('Accès refusé');
    }
    const filePath = join(IDENTITY_UPLOAD_DIR, safeFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Fichier introuvable');
    }
    res.sendFile(filePath);
  }
}
