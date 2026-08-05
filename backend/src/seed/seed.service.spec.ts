import { SeedService } from './seed.service';

describe('SeedService', () => {
  let service: SeedService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    repo = { findOne: jest.fn(), create: jest.fn((d) => d), save: jest.fn(async (d) => ({ id: 'admin-1', ...d })) };
    service = new SeedService(repo as never);
  });

  it("met à jour le mot de passe et rôle de l'admin s'il existe déjà", async () => {
    const existing = { id: 'admin-1', email: 'priscillenkengue94@gmail.com', role: 'customer', passwordHash: 'old' };
    repo.findOne.mockResolvedValue(existing);
    await service.seedAdmin();
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'priscillenkengue94@gmail.com', role: 'admin' }),
    );
  });

  it("crée l'admin par défaut avec le rôle admin et un mot de passe hashé", async () => {
    repo.findOne.mockResolvedValue(null);
    await service.seedAdmin();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'priscillenkengue94@gmail.com', role: 'admin' }),
    );
    const createArg = repo.create.mock.calls[0][0];
    expect(createArg.passwordHash).not.toBe('88888888eE@!');
    expect(repo.save).toHaveBeenCalled();
  });
});
