import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import {
  UploadsController,
  mimeFileFilter,
  productImageFilename,
  identityDestination,
  identityFilenameFor,
} from './uploads.controller';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { existsSync } from 'fs';

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
  });
  const adminToken: JwtPayload = {
    sub: 'admin-1',
    email: 'admin@test.com',
    role: 'admin',
    sellerStatus: 'none',
    blocked: false,
    customRole: null,
  };

  beforeEach(() => {
    controller = new UploadsController();
    res = { sendFile: jest.fn() };
    (existsSync as jest.Mock).mockReset();
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
      // La vérification échoue avant même de toucher le disque
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
    it("renvoie la référence du fichier téléversé pour la pièce d'identité", () => {
      const file = { filename: 'user-1-id-document-123.jpg' } as Express.Multer.File;
      expect(controller.uploadIdDocument(file)).toEqual({ ref: 'user-1-id-document-123.jpg' });
    });

    it('renvoie la référence du fichier téléversé pour la photo de profil', () => {
      const file = { filename: 'user-1-profile-photo-456.jpg' } as Express.Multer.File;
      expect(controller.uploadProfilePhoto(file)).toEqual({ ref: 'user-1-profile-photo-456.jpg' });
    });

    it("renvoie la référence du fichier téléversé pour le verso de la pièce d'identité", () => {
      const file = { filename: 'user-1-id-document-back-789.jpg' } as Express.Multer.File;
      expect(controller.uploadIdDocumentBack(file)).toEqual({ ref: 'user-1-id-document-back-789.jpg' });
    });
  });

  describe('POST /uploads/product-image (non-régression)', () => {
    it('refuse un customer qui n\'est pas vendeur approuvé', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'x@test.com',
        role: 'customer',
        sellerStatus: 'pending',
        blocked: false,
        customRole: null,
      };
      const file = { filename: 'abc.jpg' } as Express.Multer.File;
      expect(() => controller.uploadProductImage(user, file)).toThrow(ForbiddenException);
    });

    it('autorise un vendeur approuvé', () => {
      const user: JwtPayload = {
        sub: 'user-1',
        email: 'x@test.com',
        role: 'customer',
        sellerStatus: 'approved',
        blocked: false,
        customRole: null,
      };
      const file = { filename: 'abc.jpg' } as Express.Multer.File;
      expect(controller.uploadProductImage(user, file)).toEqual({ url: '/uploads/products/abc.jpg' });
    });

    it("autorise un admin même sans statut vendeur approuvé", () => {
      const file = { filename: 'abc.jpg' } as Express.Multer.File;
      expect(controller.uploadProductImage(adminToken, file)).toEqual({ url: '/uploads/products/abc.jpg' });
    });
  });

  describe('POST /uploads/avatar', () => {
    it('accepte un simple customer (aucune restriction de rôle)', () => {
      const file = { filename: 'abc.jpg' } as Express.Multer.File;
      expect(controller.uploadAvatar(file)).toEqual({ url: '/uploads/avatars/abc.jpg' });
    });
  });

  describe('mimeFileFilter (config Multer)', () => {
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

  describe('productImageFilename (config Multer)', () => {
    it('génère un nom de fichier unique en conservant l\'extension', () => {
      const cb = jest.fn();
      productImageFilename({}, { originalname: 'photo.png' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^\d+-\d+\.png$/));
    });
  });

  describe('identityDestination / identityFilenameFor (config Multer)', () => {
    it('crée le dossier privé et pointe dessus', () => {
      const cb = jest.fn();
      identityDestination({}, {} as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('uploads-private'));
    });

    it('préfixe le nom de fichier avec userId et le type de document (id-document)', () => {
      const cb = jest.fn();
      const req = { user: { sub: 'user-42' } };
      identityFilenameFor('id-document')(req, { originalname: 'piece.jpg' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^user-42-id-document-\d+-\d+\.jpg$/));
    });

    it('préfixe le nom de fichier avec userId et le type de document (profile-photo)', () => {
      const cb = jest.fn();
      const req = { user: { sub: 'user-42' } };
      identityFilenameFor('profile-photo')(req, { originalname: 'selfie.png' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^user-42-profile-photo-\d+-\d+\.png$/));
    });

    it('préfixe le nom de fichier avec userId et le type de document (id-document-back)', () => {
      const cb = jest.fn();
      const req = { user: { sub: 'user-42' } };
      identityFilenameFor('id-document-back')(req, { originalname: 'piece-verso.jpg' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^user-42-id-document-back-\d+-\d+\.jpg$/));
    });
  });
});
