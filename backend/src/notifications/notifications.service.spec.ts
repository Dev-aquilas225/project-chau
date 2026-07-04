import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; count: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    repo = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (n) => ({ id: 'notif-1', ...n })),
      find: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };
    service = new NotificationsService(repo as never);
  });

  describe('create', () => {
    it('crée une notification avec link', async () => {
      const result = await service.create('user-1', 'order_status', 'Titre', 'Message', '/commandes');
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'order_status',
        title: 'Titre',
        message: 'Message',
        link: '/commandes',
      });
      expect(result.id).toBe('notif-1');
    });

    it('crée une notification sans link (null par défaut)', async () => {
      await service.create('user-1', 'seller_status', 'Titre', 'Message');
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'seller_status',
        title: 'Titre',
        message: 'Message',
        link: null,
      });
    });
  });

  describe('findMine', () => {
    it('retourne les notifications triées par date décroissante, limitées à 30', async () => {
      repo.find.mockResolvedValue([]);
      await service.findMine('user-1');
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        take: 30,
      });
    });
  });

  describe('unreadCount', () => {
    it('compte uniquement les notifications non lues de cet utilisateur', async () => {
      repo.count.mockResolvedValue(3);
      const count = await service.unreadCount('user-1');
      expect(repo.count).toHaveBeenCalledWith({ where: { userId: 'user-1', read: false } });
      expect(count).toBe(3);
    });
  });

  describe('markRead', () => {
    it('marque comme lue la notification appartenant à cet utilisateur', async () => {
      await service.markRead('notif-1', 'user-1');
      expect(repo.update).toHaveBeenCalledWith({ id: 'notif-1', userId: 'user-1' }, { read: true });
    });

    it("IDOR : le filtre WHERE (id, userId) garantit qu'on ne peut pas marquer comme lue la notification d'un autre utilisateur", async () => {
      // La requête est construite avec le userId de l'appelant, jamais celui d'un autre —
      // si l'id appartient à un autre utilisateur, le WHERE ne matche aucune ligne (0 affectée).
      await service.markRead('notif-of-another-user', 'user-1');
      expect(repo.update).toHaveBeenCalledWith({ id: 'notif-of-another-user', userId: 'user-1' }, { read: true });
      expect(repo.update).not.toHaveBeenCalledWith({ id: 'notif-of-another-user' }, { read: true });
    });
  });

  describe('markAllRead', () => {
    it('marque comme lues toutes les notifications non lues de cet utilisateur', async () => {
      await service.markAllRead('user-1');
      expect(repo.update).toHaveBeenCalledWith({ userId: 'user-1', read: false }, { read: true });
    });
  });
});
