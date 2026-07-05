import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock };
  let jwt: JwtService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto as User),
      save: jest.fn(async (u) => ({ id: 'user-1', ...u })),
      createQueryBuilder: jest.fn(),
    };
    jwt = new JwtService({ secret: 'test-secret' });
    service = new AuthService(repo as never, jwt);
  });

  describe('register', () => {
    it('crée un utilisateur avec le rôle customer et hash le mot de passe', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.register({ displayName: 'Alice', email: 'alice@test.com', password: 'password123' });

      expect(result.user.role).toBe('customer');
      expect(result.accessToken).toBeDefined();
      const createArg = repo.create.mock.calls[0][0];
      expect(createArg.role).toBe('customer');
      expect(createArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
    });

    it('refuse un email déjà utilisé', async () => {
      repo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ displayName: 'Alice', email: 'alice@test.com', password: 'password123' }),
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

      await expect(service.login({ email: 'nobody@test.com', password: 'password123' })).rejects.toThrow(
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

      await expect(service.login({ email: 'alice@test.com', password: 'wrong-password' })).rejects.toThrow(
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

      const result = await service.login({ email: 'alice@test.com', password: 'correct-password' });
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('alice@test.com');
    });
  });
});
