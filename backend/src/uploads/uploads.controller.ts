import { Controller, ForbiddenException, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          cb(new BadRequestException('Type de fichier non autorisé'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadProductImage(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (user.role !== 'admin' && user.sellerStatus !== 'approved') {
      throw new ForbiddenException('Compte vendeur approuvé ou rôle admin requis');
    }
    return { url: `/uploads/products/${file.filename}` };
  }
}
