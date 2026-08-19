import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock };
  let magicLinkRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let jwt: JwtService;
  let mailService: { send: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto as User),
      save: jest.fn(async (u) => ({ id: 'user-1', ...u })),
      createQueryBuilder: jest.fn(),
    };
    magicLinkRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (r) => ({ id: 'link-1', ...r })),
    };
    jwt = new JwtService({ secret: 'test-secret' });
    mailService = { send: jest.fn().mockResolvedValue(undefined) };
    configService = { get: jest.fn().mockReturnValue(undefined) };
    service = new AuthService(repo as never, magicLinkRepo as never, jwt, mailService as never, configService as never);
  });

  describe('register', () => {
    it('crée un utilisateur avec le rôle customer et hash le mot de passe', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.register({ displayName: 'Alice', email: 'alice@test.com', password: 'password123' }, 'client');

      expect(result.user.role).toBe('customer');
      expect(result.accessToken).toBeDefined();
      expect((jwt.decode(result.accessToken) as { aud: string }).aud).toBe('client');
      const createArg = repo.create.mock.calls[0][0];
      expect(createArg.role).toBe('customer');
      expect(createArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
      expect(mailService.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@test.com' }));
    });

    it('refuse un email déjà utilisé', async () => {
      repo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ displayName: 'Alice', email: 'alice@test.com', password: 'password123' }, 'client'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it("refuse si l'utilisateur n'existe pas", async () => {
      repo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login({ email: 'nobody@test.com', password: 'password123' }, 'client')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refuse un mauvais mot de passe', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      repo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'user-1', email: 'alice@test.com', passwordHash, role: 'customer' }),
      });

      await expect(service.login({ email: 'alice@test.com', password: 'wrong-password' }, 'client')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('renvoie un token pour des identifiants valides', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      repo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'alice@test.com',
          displayName: 'Alice',
          passwordHash,
          role: 'customer',
          addresses: [],
          createdAt: new Date(),
        }),
      });

      const result = await service.login({ email: 'alice@test.com', password: 'correct-password' }, 'client');
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('alice@test.com');
    });

    it("émet un token d'audience 'admin' quand l'appelant est l'app admin", async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      repo.createQueryBuilder.mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'admin-1', email: 'admin@test.com', displayName: 'Admin', passwordHash, role: 'admin', addresses: [], createdAt: new Date(),
        }),
      });

      const result = await service.login({ email: 'admin@test.com', password: 'correct-password' }, 'admin');
      expect((jwt.decode(result.accessToken) as { aud: string }).aud).toBe('admin');
    });
  });

  describe('magic link', () => {
    it('requestMagicLink enregistre un jeton haché (jamais le jeton en clair) et envoie un email', async () => {
      const result = await service.requestMagicLink('Alice@Test.com');

      expect(magicLinkRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'alice@test.com', usedAt: null }),
      );
      const createArg = magicLinkRepo.create.mock.calls[0][0];
      expect(createArg.tokenHash).toMatch(/^[0-9a-f]{64}$/); // hash SHA-256, pas le jeton brut
      expect(mailService.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@test.com' }));
      // Réponse générique, ne révèle jamais si le compte existe.
      expect(result).toEqual({ message: expect.any(String) });
    });

    it('verifyMagicLink refuse un jeton inconnu', async () => {
      magicLinkRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyMagicLink('a'.repeat(64))).rejects.toThrow(UnauthorizedException);
    });

    it('verifyMagicLink refuse un jeton déjà utilisé', async () => {
      magicLinkRepo.findOne.mockResolvedValue({
        id: 'link-1', email: 'alice@test.com', tokenHash: 'x',
        expiresAt: new Date(Date.now() + 60_000), usedAt: new Date(),
      });
      await expect(service.verifyMagicLink('a'.repeat(64))).rejects.toThrow(UnauthorizedException);
    });

    it('verifyMagicLink refuse un jeton expiré', async () => {
      magicLinkRepo.findOne.mockResolvedValue({
        id: 'link-1', email: 'alice@test.com', tokenHash: 'x',
        expiresAt: new Date(Date.now() - 1000), usedAt: null,
      });
      await expect(service.verifyMagicLink('a'.repeat(64))).rejects.toThrow(UnauthorizedException);
    });

    it('verifyMagicLink connecte un utilisateur existant et marque le jeton consommé', async () => {
      const tokenRow = {
        id: 'link-1', email: 'alice@test.com', tokenHash: 'x',
        expiresAt: new Date(Date.now() + 60_000), usedAt: null,
      };
      magicLinkRepo.findOne.mockResolvedValue(tokenRow);
      repo.findOne.mockResolvedValue({
        id: 'user-1', email: 'alice@test.com', displayName: 'Alice', role: 'customer', addresses: [],
      });

      const result = await service.verifyMagicLink('a'.repeat(64));

      expect(magicLinkRepo.save).toHaveBeenCalledWith(expect.objectContaining({ usedAt: expect.any(Date) }));
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('alice@test.com');
      // Le lien magique n'émet jamais que des tokens d'audience 'client' (fonctionnalité client uniquement).
      expect((jwt.decode(result.accessToken) as { aud: string }).aud).toBe('client');
      // Compte déjà existant : pas de nouvel email de bienvenue.
      expect(mailService.send).not.toHaveBeenCalled();
    });

    it("verifyMagicLink crée un compte à la volée si l'email n'a pas de compte existant", async () => {
      magicLinkRepo.findOne.mockResolvedValue({
        id: 'link-1', email: 'nouveau@test.com', tokenHash: 'x',
        expiresAt: new Date(Date.now() + 60_000), usedAt: null,
      });
      repo.findOne.mockResolvedValue(null);

      const result = await service.verifyMagicLink('a'.repeat(64));

      const createArg = repo.create.mock.calls[0][0];
      expect(createArg.email).toBe('nouveau@test.com');
      expect(createArg.role).toBe('customer');
      expect(result.accessToken).toBeDefined();
      expect(mailService.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'nouveau@test.com' }));
    });

    it('verifyMagicLink refuse un compte bloqué', async () => {
      magicLinkRepo.findOne.mockResolvedValue({
        id: 'link-1', email: 'alice@test.com', tokenHash: 'x',
        expiresAt: new Date(Date.now() + 60_000), usedAt: null,
      });
      repo.findOne.mockResolvedValue({ id: 'user-1', email: 'alice@test.com', displayName: 'Alice', blocked: true });

      await expect(service.verifyMagicLink('a'.repeat(64))).rejects.toThrow(UnauthorizedException);
    });
  });
});
