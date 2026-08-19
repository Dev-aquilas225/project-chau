import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { UploadsController, mimeFileFilter } from './uploads.controller';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { existsSync } from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { writeFile } from 'fs/promises';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const NOT_AN_IMAGE = Buffer.from('<script>alert(1)</script>');

function makeFile(buffer: Buffer): Express.Multer.File {
  return { buffer, originalname: 'whatever.jpg', mimetype: 'image/png' } as Express.Multer.File;
}

describe('UploadsController', () => {
  let controller: UploadsController;
  let res: { sendFile: jest.Mock };

  const customerToken = (sub: string): JwtPayload => ({
    sub,
    email: `${sub}@test.com`,
    role: 'customer',
    sellerStatus: 'approved',
    blocked: false,
    customRole: null,
    aud: 'client',
  });
  const adminToken: JwtPayload = {
    sub: 'admin-1',
    email: 'admin@test.com',
    role: 'admin',
    sellerStatus: 'none',
    blocked: false,
    customRole: null,
    aud: 'admin',
  };

  beforeEach(() => {
    controller = new UploadsController();
    res = { sendFile: jest.fn() };
    (existsSync as jest.Mock).mockReset();
    (writeFile as jest.Mock).mockClear();
  });

  describe('GET /uploads/identity/:filename', () => {
    it("refuse (403) l'accès au fichier d'un autre utilisateur pour un non-admin (IDOR)", () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      expect(() =>
        controller.getIdentityFile(customerToken('user-1'), 'user-2-id-document-123.jpg', res as unknown as Response),
      ).toThrow(ForbiddenException);
      expect(res.sendFile).not.toHaveBeenCalled();
    });

    it('autorise (200) le propriétaire du fichier (préfixe userId correct)', () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      controller.getIdentityFile(customerToken('user-1'), 'user-1-id-document-123.jpg', res as unknown as Response);

      expect(res.sendFile).toHaveBeenCalledTimes(1);
    });

    it("autorise (200) un admin à accéder au fichier de n'importe quel utilisateur", () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      controller.getIdentityFile(adminToken, 'user-1-id-document-123.jpg', res as unknown as Response);

      expect(res.sendFile).toHaveBeenCalledTimes(1);
    });

    it("renvoie 404 si le fichier (autorisé) n'existe pas sur le disque", () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      expect(() =>
        controller.getIdentityFile(customerToken('user-1'), 'user-1-id-document-123.jpg', res as unknown as Response),
      ).toThrow(NotFoundException);
      expect(res.sendFile).not.toHaveBeenCalled();
    });

    it('bloque une tentative de path traversal (../../etc/passwd) via basename()', () => {
      expect(() =>
        controller.getIdentityFile(customerToken('user-1'), '../../etc/passwd', res as unknown as Response),
      ).toThrow(ForbiddenException);
      expect(res.sendFile).not.toHaveBeenCalled();
      expect(existsSync).not.toHaveBeenCalled();
    });

    it('bloque une tentative de path traversal avec séparateurs windows', () => {
      expect(() =>
        controller.getIdentityFile(customerToken('user-1'), '..\\..\\windows\\win.ini', res as unknown as Response),
      ).toThrow(ForbiddenException);
      expect(res.sendFile).not.toHaveBeenCalled();
    });
  });

  describe('POST /uploads/identity/id-document et /profile-photo', () => {
    it("renvoie la référence du fichier téléversé pour la pièce d'identité, préfixée par userId", async () => {
      const result = await controller.uploadIdDocument(customerToken('user-1'), makeFile(PNG_SIGNATURE));
      expect(result.ref).toMatch(/^user-1-id-document-\d+-\d+\.png$/);
      expect(writeFile).toHaveBeenCalled();
    });

    it('renvoie la référence du fichier téléversé pour la photo de profil', async () => {
      const result = await controller.uploadProfilePhoto(customerToken('user-1'), makeFile(PNG_SIGNATURE));
      expect(result.ref).toMatch(/^user-1-profile-photo-\d+-\d+\.png$/);
    });

    it("renvoie la référence du fichier téléversé pour le verso de la pièce d'identité", async () => {
      const result = await controller.uploadIdDocumentBack(customerToken('user-1'), makeFile(PNG_SIGNATURE));
      expect(result.ref).toMatch(/^user-1-id-document-back-\d+-\d+\.png$/);
    });

    it('rejette un fichier dont le contenu réel ne correspond à aucun format image (magic bytes)', async () => {
      await expect(controller.uploadIdDocument(customerToken('user-1'), makeFile(NOT_AN_IMAGE))).rejects.toThrow(BadRequestException);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('POST /uploads/product-image', () => {
    it("refuse (403) un customer qui n'est pas vendeur approuvé, sans écrire de fichier", async () => {
      const user: JwtPayload = { sub: 'user-1', email: 'x@test.com', role: 'customer', sellerStatus: 'pending', blocked: false, customRole: null, aud: 'client' };
      await expect(controller.uploadProductImage(user, makeFile(PNG_SIGNATURE))).rejects.toThrow(ForbiddenException);
      // L'autorisation est vérifiée avant toute écriture sur disque.
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('autorise un vendeur approuvé et écrit le fichier validé', async () => {
      const user: JwtPayload = { sub: 'user-1', email: 'x@test.com', role: 'customer', sellerStatus: 'approved', blocked: false, customRole: null, aud: 'client' };
      const result = await controller.uploadProductImage(user, makeFile(PNG_SIGNATURE));
      expect(result.url).toMatch(/^\/uploads\/products\/\d+-\d+\.png$/);
      expect(writeFile).toHaveBeenCalledTimes(1);
    });

    it('autorise un admin même sans statut vendeur approuvé', async () => {
      const result = await controller.uploadProductImage(adminToken, makeFile(PNG_SIGNATURE));
      expect(result.url).toMatch(/^\/uploads\/products\/\d+-\d+\.png$/);
    });

    it("rejette (400) un fichier dont le contenu réel n'est pas une image, même avec un mimetype/extension usurpés", async () => {
      const user: JwtPayload = { sub: 'user-1', email: 'x@test.com', role: 'customer', sellerStatus: 'approved', blocked: false, customRole: null, aud: 'client' };
      await expect(controller.uploadProductImage(user, makeFile(NOT_AN_IMAGE))).rejects.toThrow(BadRequestException);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('POST /uploads/avatar', () => {
    it('accepte un simple customer (aucune restriction de rôle)', async () => {
      const result = await controller.uploadAvatar(makeFile(PNG_SIGNATURE));
      expect(result.url).toMatch(/^\/uploads\/avatars\/\d+-\d+\.png$/);
    });
  });

  describe('mimeFileFilter (config Multer — première ligne de filtrage, non suffisante seule)', () => {
    it('accepte un type MIME autorisé (image/png)', () => {
      const cb = jest.fn();
      mimeFileFilter({}, { mimetype: 'image/png' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('rejette un type MIME non autorisé (application/pdf)', () => {
      const cb = jest.fn();
      mimeFileFilter({}, { mimetype: 'application/pdf' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), false);
    });
  });
});
