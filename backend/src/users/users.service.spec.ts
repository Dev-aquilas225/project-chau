import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  const baseUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'user@test.com',
      displayName: 'Jean',
      role: 'customer',
      sellerStatus: 'none',
      sellerProfile: {},
      addresses: [],
      createdAt: new Date(),
      ...overrides,
    }) as User;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (u) => u),
    };
    service = new UsersService(repo as never);
  });

  describe('updateProfile', () => {
    it('met à jour photoURL/bio/country/city', async () => {
      repo.findOne.mockResolvedValue(baseUser());

      const result = await service.updateProfile('user-1', {
        photoURL: '/uploads/avatars/abc.jpg',
        bio: 'Passionnée de mode vintage',
        country: 'France',
        city: 'Paris',
      });

      expect(result.photoURL).toBe('/uploads/avatars/abc.jpg');
      expect(result.bio).toBe('Passionnée de mode vintage');
      expect(result.country).toBe('France');
      expect(result.city).toBe('Paris');
    });

    it("refuse si l'utilisateur est introuvable", async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateProfile('missing', { bio: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('sanitize (via findOne)', () => {
    it('expose photoURL/bio/country/city', async () => {
      repo.findOne.mockResolvedValue(
        baseUser({ photoURL: '/uploads/avatars/abc.jpg', bio: 'Bio', country: 'France', city: 'Lyon' }),
      );

      const result = await service.findOne('user-1');

      expect(result.photoURL).toBe('/uploads/avatars/abc.jpg');
      expect(result.bio).toBe('Bio');
      expect(result.country).toBe('France');
      expect(result.city).toBe('Lyon');
    });
  });
});
