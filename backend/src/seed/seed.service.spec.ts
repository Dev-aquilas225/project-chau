import { SeedService } from './seed.service';

describe('SeedService', () => {
  let service: SeedService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    repo = { findOne: jest.fn(), create: jest.fn((d) => d), save: jest.fn(async (d) => ({ id: 'admin-1', ...d })) };
    service = new SeedService(repo as never);
  });

  it("ne crée pas l'admin s'il existe déjà (idempotent)", async () => {
    repo.findOne.mockResolvedValue({ id: 'existing-admin', email: 'admin@gmail.com' });
    await service.seedAdmin();
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("crée l'admin par défaut avec le rôle admin et un mot de passe hashé", async () => {
    repo.findOne.mockResolvedValue(null);
    await service.seedAdmin();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'admin@gmail.com', role: 'admin' }),
    );
    const createArg = repo.create.mock.calls[0][0];
    expect(createArg.passwordHash).not.toBe('admin1234');
    expect(repo.save).toHaveBeenCalled();
  });
});
