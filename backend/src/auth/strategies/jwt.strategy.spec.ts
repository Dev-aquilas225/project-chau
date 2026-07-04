import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let repo: { findOne: jest.Mock };
  let config: ConfigService;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    config = { get: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;
    strategy = new JwtStrategy(config, repo as never);
  });

  it('relit role/sellerStatus depuis la base plutôt que de faire confiance au payload signé', async () => {
    const dbUser = {
      id: 'user-1',
      email: 'user@test.com',
      role: 'customer',
      sellerStatus: 'approved',
    } as User;
    repo.findOne.mockResolvedValue(dbUser);

    // Le payload décodé porte un sellerStatus périmé ('pending') : la stratégie doit ignorer
    // cette valeur et retourner l'état courant de la base (ici 'approved', suite à une
    // validation admin survenue après l'émission du token).
    const stalePayload = { sub: 'user-1', email: 'user@test.com', role: 'customer' as const, sellerStatus: 'pending' as const };

    const result = await strategy.validate(stalePayload);

    expect(result).toEqual({ sub: 'user-1', email: 'user@test.com', role: 'customer', sellerStatus: 'approved' });
  });

  it("relit également le rôle depuis la base (promotion admin prise en compte immédiatement)", async () => {
    const dbUser = { id: 'user-1', email: 'user@test.com', role: 'admin', sellerStatus: 'none' } as User;
    repo.findOne.mockResolvedValue(dbUser);

    const stalePayload = { sub: 'user-1', email: 'user@test.com', role: 'customer' as const, sellerStatus: 'none' as const };

    const result = await strategy.validate(stalePayload);

    expect(result.role).toBe('admin');
  });

  it("rejette avec UnauthorizedException si l'utilisateur n'existe plus", async () => {
    repo.findOne.mockResolvedValue(null);
    const payload = { sub: 'missing', email: 'ghost@test.com', role: 'customer' as const, sellerStatus: 'none' as const };

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
