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
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { basename, extname, join } from 'path';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const IDENTITY_UPLOAD_DIR = join(process.cwd(), 'uploads-private', 'identity');

export function mimeFileFilter(_req: unknown, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    cb(new BadRequestException('Type de fichier non autorisé'), false);
    return;
  }
  cb(null, true);
}

export function productImageFilename(_req: unknown, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  cb(null, `${unique}${extname(file.originalname)}`);
}

export function identityDestination(_req: unknown, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
  mkdirSync(IDENTITY_UPLOAD_DIR, { recursive: true });
  cb(null, IDENTITY_UPLOAD_DIR);
}

export function identityFilenameFor(kind: 'id-document' | 'id-document-back' | 'profile-photo') {
  return (req: unknown, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const userId = (req as unknown as { user: JwtPayload }).user.sub;
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${userId}-${kind}-${unique}${extname(file.originalname)}`);
  };
}

function identityStorage(kind: 'id-document' | 'id-document-back' | 'profile-photo') {
  return diskStorage({
    destination: identityDestination,
    filename: identityFilenameFor(kind),
  });
}

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: productImageFilename,
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: mimeFileFilter,
    }),
  )
  uploadProductImage(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (user.role !== 'admin' && user.sellerStatus !== 'approved') {
      throw new ForbiddenException('Compte vendeur approuvé ou rôle admin requis');
    }
    return { url: `/uploads/products/${file.filename}` };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: productImageFilename,
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: mimeFileFilter,
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/avatars/${file.filename}` };
  }

  @Post('identity/id-document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: identityStorage('id-document'),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: mimeFileFilter,
    }),
  )
  uploadIdDocument(@UploadedFile() file: Express.Multer.File) {
    return { ref: file.filename };
  }

  @Post('identity/id-document-back')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: identityStorage('id-document-back'),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: mimeFileFilter,
    }),
  )
  uploadIdDocumentBack(@UploadedFile() file: Express.Multer.File) {
    return { ref: file.filename };
  }

  @Post('identity/profile-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: identityStorage('profile-photo'),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: mimeFileFilter,
    }),
  )
  uploadProfilePhoto(@UploadedFile() file: Express.Multer.File) {
    return { ref: file.filename };
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
