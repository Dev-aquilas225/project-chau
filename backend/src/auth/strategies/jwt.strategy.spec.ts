import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let repo: { findOne: jest.Mock };
  let config: ConfigService;

  const reqWithApp = (app?: string): Request =>
    ({ headers: app ? { 'x-client-app': app } : {} }) as unknown as Request;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    config = { get: jest.fn().mockReturnValue('test-secret-for-unit-tests-0123456789') } as unknown as ConfigService;
    strategy = new JwtStrategy(config, repo as never);
  });

  it('relit role/sellerStatus depuis la base plutôt que de faire confiance au payload signé', async () => {
    const dbUser = {
      id: 'user-1',
      email: 'user@test.com',
      role: 'customer',
      sellerStatus: 'approved',
      blocked: false,
      customRole: null,
    } as User;
    repo.findOne.mockResolvedValue(dbUser);

    // Le payload décodé porte un sellerStatus périmé ('pending') : la stratégie doit ignorer
    // cette valeur et retourner l'état courant de la base (ici 'approved', suite à une
    // validation admin survenue après l'émission du token).
    const stalePayload = {
      sub: 'user-1',
      email: 'user@test.com',
      role: 'customer' as const,
      sellerStatus: 'pending' as const,
      blocked: false,
      customRole: null,
      aud: 'client' as const,
    };

    const result = await strategy.validate(reqWithApp('client'), stalePayload);

    expect(result).toEqual({
      sub: 'user-1',
      email: 'user@test.com',
      role: 'customer',
      sellerStatus: 'approved',
      blocked: false,
      customRole: null,
      aud: 'client',
    });
  });

  it("relit également le rôle depuis la base (promotion admin prise en compte immédiatement)", async () => {
    const dbUser = {
      id: 'user-1',
      email: 'user@test.com',
      role: 'admin',
      sellerStatus: 'none',
      blocked: false,
      customRole: null,
    } as User;
    repo.findOne.mockResolvedValue(dbUser);

    const stalePayload = {
      sub: 'user-1',
      email: 'user@test.com',
      role: 'customer' as const,
      sellerStatus: 'none' as const,
      blocked: false,
      customRole: null,
      aud: 'admin' as const,
    };

    const result = await strategy.validate(reqWithApp('admin'), stalePayload);

    expect(result.role).toBe('admin');
  });

  it("rejette avec UnauthorizedException si l'utilisateur n'existe plus", async () => {
    repo.findOne.mockResolvedValue(null);
    const payload = {
      sub: 'missing',
      email: 'ghost@test.com',
      role: 'customer' as const,
      sellerStatus: 'none' as const,
      blocked: false,
      customRole: null,
      aud: 'client' as const,
    };

    await expect(strategy.validate(reqWithApp('client'), payload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejette avec UnauthorizedException si le compte est bloqué', async () => {
    const dbUser = {
      id: 'user-1',
      email: 'user@test.com',
      role: 'customer',
      sellerStatus: 'approved',
      blocked: true,
      customRole: null,
    } as User;
    repo.findOne.mockResolvedValue(dbUser);
    const payload = {
      sub: 'user-1',
      email: 'user@test.com',
      role: 'customer' as const,
      sellerStatus: 'approved' as const,
      blocked: false,
      customRole: null,
      aud: 'client' as const,
    };

    await expect(strategy.validate(reqWithApp('client'), payload)).rejects.toThrow(UnauthorizedException);
  });

  describe('séparation client / admin (claim aud)', () => {
    const dbUser = {
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
      sellerStatus: 'none',
      blocked: false,
      customRole: null,
    } as User;

    it("rejette un token émis pour le client quand l'appelant se déclare admin (X-Client-App: admin)", async () => {
      repo.findOne.mockResolvedValue(dbUser);
      const clientPayload = {
        sub: 'user-1', email: 'admin@test.com', role: 'admin' as const, sellerStatus: 'none' as const,
        blocked: false, customRole: null, aud: 'client' as const,
      };

      await expect(strategy.validate(reqWithApp('admin'), clientPayload)).rejects.toThrow(UnauthorizedException);
    });

    it("rejette un token émis pour l'admin quand l'appelant se déclare client (X-Client-App: client)", async () => {
      repo.findOne.mockResolvedValue(dbUser);
      const adminPayload = {
        sub: 'user-1', email: 'admin@test.com', role: 'admin' as const, sellerStatus: 'none' as const,
        blocked: false, customRole: null, aud: 'admin' as const,
      };

      await expect(strategy.validate(reqWithApp('client'), adminPayload)).rejects.toThrow(UnauthorizedException);
    });

    it("rejette un token client quand l'en-tête X-Client-App est absent (traité comme 'client' par défaut, donc accepté ici) — cas de contrôle", async () => {
      repo.findOne.mockResolvedValue(dbUser);
      const clientPayload = {
        sub: 'user-1', email: 'admin@test.com', role: 'admin' as const, sellerStatus: 'none' as const,
        blocked: false, customRole: null, aud: 'client' as const,
      };

      // Sans en-tête, resolveAudience retombe sur 'client' : un token 'client' passe,
      // mais un token 'admin' serait rejeté (comportement le moins permissif par défaut).
      const result = await strategy.validate(reqWithApp(undefined), clientPayload);
      expect(result.sub).toBe('user-1');
    });
  });
});
