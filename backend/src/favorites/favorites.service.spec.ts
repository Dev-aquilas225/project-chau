import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let repo: { find: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock; delete: jest.Mock };

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn(async (d) => ({ id: 'fav-1', ...d })),
      delete: jest.fn(),
    };
    service = new FavoritesService(repo as never);
  });

  describe('findMine', () => {
    it('renvoie la liste des productId du user', async () => {
      repo.find.mockResolvedValue([{ productId: 'p1' }, { productId: 'p2' }]);
      const result = await service.findMine('u1');
      expect(result).toEqual(['p1', 'p2']);
      expect(repo.find).toHaveBeenCalledWith({ where: { userId: 'u1' } });
    });
  });

  describe('add', () => {
    it('crée un favori si absent', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.add('u1', 'p1');
      expect(repo.create).toHaveBeenCalledWith({ userId: 'u1', productId: 'p1' });
      expect(result).toEqual({ id: 'fav-1', userId: 'u1', productId: 'p1' });
    });

    it('renvoie le favori existant sans le dupliquer', async () => {
      const existing = { id: 'fav-existing', userId: 'u1', productId: 'p1' };
      repo.findOne.mockResolvedValue(existing);
      const result = await service.add('u1', 'p1');
      expect(repo.create).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });
  });

  describe('remove', () => {
    it('supprime le favori du user', async () => {
      const result = await service.remove('u1', 'p1');
      expect(repo.delete).toHaveBeenCalledWith({ userId: 'u1', productId: 'p1' });
      expect(result).toEqual({ deleted: true });
    });
  });
});
