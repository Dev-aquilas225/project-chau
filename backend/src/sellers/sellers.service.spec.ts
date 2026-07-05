import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { User, SellerStatus } from '../users/entities/user.entity';
import { ApplySellerDto } from './dto/seller.dto';

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  // Garde le comportement réel par défaut (bcrypt/node-pre-gyp en dépendent au chargement
  // du module), tout en permettant aux tests de surcharger existsSync via mockReturnValue.
  return { ...actual, existsSync: jest.fn(actual.existsSync) };
});
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { existsSync } from 'fs';

describe('SellersService', () => {
  let service: SellersService;
  let repo: { findOne: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock };
  let authService: { signToken: jest.Mock };
  let notificationsService: { create: jest.Mock; notifyAdmins: jest.Mock };
  const existsSyncSpy = existsSync as jest.Mock;

  const baseUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'seller@test.com',
      displayName: 'Seller',
      role: 'customer',
      sellerStatus: 'none' as SellerStatus,
      sellerProfile: {},
      addresses: [],
      createdAt: new Date(),
      ...overrides,
    }) as User;

  const validDto: ApplySellerDto = {
    storeName: 'Ma Boutique',
    bio: 'Une belle boutique',
    idType: 'national_id',
    idNumber: 'ID123456',
    idCountry: 'FR',
    fullNameOnId: 'Jean Dupont',
    dateOfBirth: '1990-01-01',
    idDocumentRef: 'user-1-id-document-123.jpg',
    idDocumentBackRef: 'user-1-id-document-back-789.jpg',
    profilePhotoRef: 'user-1-profile-photo-456.jpg',
  };

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn(async (u) => u),
      createQueryBuilder: jest.fn(),
    };
    authService = { signToken: jest.fn().mockReturnValue('signed-jwt-token') };
    notificationsService = { create: jest.fn(), notifyAdmins: jest.fn() };
    service = new SellersService(repo as never, authService as never, notificationsService as never);
    existsSyncSpy.mockReset();
  });

  describe('apply', () => {
    it("passe en 'pending' après une candidature complète et valide (pas d'auto-approbation)", async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);

      const result = await service.apply('user-1', validDto);

      expect(repo.save).toHaveBeenCalledTimes(1);
      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.sellerStatus).toBe('pending');
      expect(savedUser.sellerProfile).toMatchObject({
        storeName: 'Ma Boutique',
        bio: 'Une belle boutique',
        idType: 'national_id',
        idNumber: 'ID123456',
        idCountry: 'FR',
        fullNameOnId: 'Jean Dupont',
        dateOfBirth: '1990-01-01',
        idDocumentRef: 'user-1-id-document-123.jpg',
        idDocumentBackRef: 'user-1-id-document-back-789.jpg',
        profilePhotoRef: 'user-1-profile-photo-456.jpg',
      });
      expect(savedUser.sellerProfile.submittedAt).toBeDefined();
      expect(savedUser.sellerProfile.verifiedAt).toBeUndefined();

      // signToken doit recevoir l'utilisateur sauvegardé (statut pending)
      expect(authService.signToken).toHaveBeenCalledWith(savedUser);
      expect(result.accessToken).toBe('signed-jwt-token');

      // Non-régression sécurité : aucun champ PII brut ne doit fuiter dans la réponse
      expect(result.user).toBeDefined();
      const serialized = JSON.stringify(result.user);
      for (const piiField of ['idNumber', 'dateOfBirth', 'idDocumentRef', 'idDocumentBackRef', 'profilePhotoRef', 'idCountry', 'fullNameOnId', 'idType']) {
        expect(serialized).not.toContain(piiField);
      }
      expect(serialized).not.toContain('ID123456');
      expect(serialized).not.toContain('1990-01-01');
    });

    it("gère 'bio' manquant en le remplaçant par une chaîne vide", async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);
      const { bio: _bio, ...dtoWithoutBio } = validDto;

      await service.apply('user-1', dtoWithoutBio as ApplySellerDto);

      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.sellerProfile.bio).toBe('');
    });

    it.each<SellerStatus>(['pending', 'approved', 'rejected'])(
      "refuse si sellerStatus est déjà '%s' (BadRequestException, save jamais appelé)",
      async (status) => {
        const user = baseUser({ sellerStatus: status });
        repo.findOne.mockResolvedValue(user);

        await expect(service.apply('user-1', validDto)).rejects.toThrow(BadRequestException);
        expect(repo.save).not.toHaveBeenCalled();
      },
    );

    it("refuse si l'utilisateur est introuvable", async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.apply('missing-user', validDto)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it("refuse si idDocumentRef ne correspond à aucun fichier existant sur le disque", async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(false);

      await expect(service.apply('user-1', validDto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('refuse si idDocumentRef ne commence pas par ${userId}- (tentative de référencer le document d\'un autre utilisateur)', async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);

      const dto = { ...validDto, idDocumentRef: 'user-2-id-document-999.jpg' };

      await expect(service.apply('user-1', dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('refuse si profilePhotoRef ne commence pas par ${userId}- (IDOR)', async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);

      const dto = { ...validDto, profilePhotoRef: 'user-2-profile-photo-999.jpg' };

      await expect(service.apply('user-1', dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('refuse une référence contenant un séparateur de chemin (tentative de path traversal)', async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);

      const dto = { ...validDto, idDocumentRef: '../../etc/passwd' };

      await expect(service.apply('user-1', dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('refuse une référence contenant un séparateur de chemin windows (tentative de path traversal)', async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);

      const dto = { ...validDto, profilePhotoRef: '..\\..\\windows\\win.ini' };

      await expect(service.apply('user-1', dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it("refuse si idDocumentBackRef (verso CNI) ne correspond à aucun fichier existant sur le disque", async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockImplementation((path: string) => !String(path).includes('id-document-back'));

      await expect(service.apply('user-1', validDto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it("enregistre idDocumentBackRef à undefined pour un passeport, même si fourni par le client", async () => {
      const user = baseUser();
      repo.findOne.mockResolvedValue(user);
      existsSyncSpy.mockReturnValue(true);

      const dto = { ...validDto, idType: 'passport' as const };
      await service.apply('user-1', dto);

      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.sellerProfile.idDocumentBackRef).toBeUndefined();
    });
  });

  describe('sanitizeSelf (via getMyProfile)', () => {
    it("n'expose jamais les champs KYC bruts, seulement storeName/bio/iban/identityVerified/reviewNote/reviewedAt", async () => {
      const user = baseUser({
        sellerStatus: 'approved',
        sellerProfile: {
          storeName: 'Ma Boutique',
          bio: 'Bio',
          iban: 'FR7630006000011234567890189',
          idType: 'national_id',
          idNumber: 'SECRET-ID-NUMBER',
          idCountry: 'FR',
          fullNameOnId: 'Jean Dupont',
          dateOfBirth: '1990-01-01',
          idDocumentRef: 'user-1-id-document-123.jpg',
          idDocumentBackRef: 'user-1-id-document-back-789.jpg',
          profilePhotoRef: 'user-1-profile-photo-456.jpg',
          submittedAt: '2026-01-01T00:00:00.000Z',
          verifiedAt: '2026-01-01T00:00:00.000Z',
        },
      });
      repo.findOne.mockResolvedValue(user);

      const result = await service.getMyProfile('user-1');

      expect(result.sellerProfile).toEqual({
        storeName: 'Ma Boutique',
        bio: 'Bio',
        iban: 'FR7630006000011234567890189',
        reviewNote: undefined,
        reviewedAt: undefined,
      });
      expect(result.identityVerified).toBe(true);

      const serialized = JSON.stringify(result);
      for (const piiField of ['idNumber', 'SECRET-ID-NUMBER', 'dateOfBirth', 'idDocumentRef', 'idDocumentBackRef', 'profilePhotoRef', 'idCountry', 'fullNameOnId', 'submittedAt', 'verifiedAt']) {
        expect(serialized).not.toContain(piiField);
      }
    });

    it("expose le motif de rejet (reviewNote/reviewedAt) quand présent", async () => {
      const user = baseUser({
        sellerStatus: 'rejected',
        sellerProfile: {
          storeName: 'Ma Boutique',
          reviewNote: 'Photo de la pièce illisible',
          reviewedAt: '2026-01-02T00:00:00.000Z',
        },
      });
      repo.findOne.mockResolvedValue(user);

      const result = await service.getMyProfile('user-1');

      expect(result.sellerProfile.reviewNote).toBe('Photo de la pièce illisible');
      expect(result.sellerProfile.reviewedAt).toBe('2026-01-02T00:00:00.000Z');
    });

    it("identityVerified est false si sellerStatus n'est pas 'approved'", async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      const result = await service.getMyProfile('user-1');
      expect(result.identityVerified).toBe(false);
    });

    it("refuse si l'utilisateur est introuvable", async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getMyProfile('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sanitizeAdmin (via listSellers)', () => {
    it('expose les champs KYC complets (documents, infos identité) pour la vue admin', async () => {
      const user = baseUser({
        sellerStatus: 'pending',
        sellerProfile: {
          storeName: 'Ma Boutique',
          idType: 'national_id',
          idNumber: 'ID123456',
          idCountry: 'FR',
          fullNameOnId: 'Jean Dupont',
          dateOfBirth: '1990-01-01',
          idDocumentRef: 'user-1-id-document-123.jpg',
          idDocumentBackRef: 'user-1-id-document-back-789.jpg',
          profilePhotoRef: 'user-1-profile-photo-456.jpg',
          submittedAt: '2026-01-01T00:00:00.000Z',
        },
      });
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([user]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const [result] = await service.listSellers();

      expect(result.sellerProfile).toMatchObject({
        idType: 'national_id',
        idNumber: 'ID123456',
        idCountry: 'FR',
        fullNameOnId: 'Jean Dupont',
        dateOfBirth: '1990-01-01',
        idDocumentRef: 'user-1-id-document-123.jpg',
        idDocumentBackRef: 'user-1-id-document-back-789.jpg',
        profilePhotoRef: 'user-1-profile-photo-456.jpg',
      });
    });
  });

  describe('updateMyProfile', () => {
    it("refuse si le compte vendeur n'est pas approuvé", async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      await expect(service.updateMyProfile('user-1', { storeName: 'x' })).rejects.toThrow(ForbiddenException);
    });

    it('met à jour le profil (storeName/bio/iban) si le compte est approuvé', async () => {
      const user = baseUser({ sellerStatus: 'approved', sellerProfile: { storeName: 'Old', bio: 'old bio' } });
      repo.findOne.mockResolvedValue(user);
      const result = await service.updateMyProfile('user-1', { storeName: 'New' });
      expect(result.sellerProfile.storeName).toBe('New');
    });
  });

  describe('listSellers', () => {
    it('filtre par statut quand fourni', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([baseUser({ sellerStatus: 'approved' })]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.listSellers('approved');

      expect(qb.andWhere).toHaveBeenCalledWith('user.sellerStatus = :status', { status: 'approved' });
      expect(result).toHaveLength(1);
    });

    it('ne filtre pas par statut si non fourni', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.listSellers();

      expect(qb.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it("refuse si l'utilisateur n'a pas soumis de candidature (sellerStatus 'none')", async () => {
      const user = baseUser({ sellerStatus: 'none' });
      repo.findOne.mockResolvedValue(user);
      await expect(service.updateStatus('user-1', { status: 'approved' })).rejects.toThrow(BadRequestException);
    });

    it("met à jour le statut vers 'approved' et fixe verifiedAt/reviewedAt", async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      const result = await service.updateStatus('user-1', { status: 'approved' });
      expect(result.sellerStatus).toBe('approved');
      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.sellerProfile.verifiedAt).toBeDefined();
      expect(savedUser.sellerProfile.reviewedAt).toBeDefined();
    });

    it("notifie le vendeur (userId cible) lors de l'approbation", async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      await service.updateStatus('user-1', { status: 'approved' });
      expect(notificationsService.create).toHaveBeenCalledWith(
        'user-1',
        'seller_status',
        "Vérification d'identité",
        expect.stringContaining('approuvé'),
        '/espace-vendeur',
      );
    });

    it("persiste le motif de rejet (reviewNote) et ne fixe pas verifiedAt", async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      const result = await service.updateStatus('user-1', { status: 'rejected', note: 'Document illisible' });
      expect(result.sellerStatus).toBe('rejected');
      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.sellerProfile.reviewNote).toBe('Document illisible');
      expect(savedUser.sellerProfile.reviewedAt).toBeDefined();
      expect(savedUser.sellerProfile.verifiedAt).toBeUndefined();
    });

    it('notifie le vendeur avec le motif inclus lors du rejet', async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      await service.updateStatus('user-1', { status: 'rejected', note: 'Document illisible' });
      expect(notificationsService.create).toHaveBeenCalledWith(
        'user-1',
        'seller_status',
        "Vérification d'identité",
        expect.stringContaining('Document illisible'),
        '/devenir-vendeur',
      );
    });

    it("rejet sans motif : reviewNote reste indéfini (pas de chaîne vide)", async () => {
      const user = baseUser({ sellerStatus: 'pending' });
      repo.findOne.mockResolvedValue(user);
      await service.updateStatus('user-1', { status: 'rejected' });
      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.sellerProfile.reviewNote).toBeUndefined();
    });

    it("refuse si l'utilisateur cible est introuvable", async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus('missing', { status: 'approved' })).rejects.toThrow(NotFoundException);
    });
  });
});
