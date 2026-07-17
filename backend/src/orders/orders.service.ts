import { Injectable, NotFoundException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offers/entities/offer.entity';
import { PlatformConfigService } from '../platform-config/platform-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderDto, CreateCheckoutSessionDto } from './dto/order.dto';

const STATUS_LABEL_FR: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderStatusHistory) private historyRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @Inject(forwardRef(() => StripeService)) private stripeService: StripeService,
    private platformConfig: PlatformConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const commissionRate = await this.platformConfig.getValue('commissionRate');

    // Extract sellerId from the first product in the order
    let sellerId: string | null = null;
    if (dto.items.length > 0) {
      const firstProduct = await this.productsRepo.findOne({ where: { id: dto.items[0].productId } });
      sellerId = firstProduct?.sellerId ?? null;
    }

    const total = dto.total;
    const platformFee = sellerId ? Math.round((total * commissionRate) / 100 * 100) / 100 : 0;
    const sellerPayout = sellerId ? Math.round((total - platformFee) * 100) / 100 : 0;

    const order = this.ordersRepo.create({
      ...dto,
      discount: dto.discount ?? 0,
      userId,
      sellerId,
      platformFee,
      sellerPayout,
      payoutStatus: 'pending',
      status: 'pending',
    });
    const saved = await this.ordersRepo.save(order);
    await this.historyRepo.save(this.historyRepo.create({ orderId: saved.id, status: 'pending' }));
    await this.notificationsService.notifyAdmins(
      'new_order',
      'Nouvelle commande',
      `Commande de ${total.toFixed(2)} € reçue`,
      `/commandes/${saved.id}`,
    );
    return saved;
  }

  findMine(userId: string) {
    return this.ordersRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  findAll(status?: OrderStatus) {
    return this.ordersRepo.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  findSeller(sellerId: string) {
    return this.ordersRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    const statusHistory = await this.historyRepo.find({
      where: { orderId: id },
      order: { createdAt: 'ASC' },
    });
    return { ...order, statusHistory };
  }

  async updateStatus(id: string, status: OrderStatus, note?: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.status = status;
    const saved = await this.ordersRepo.save(order);
    await this.historyRepo.save(this.historyRepo.create({ orderId: id, status, note: note ?? null }));
    await this.notificationsService.create(
      order.userId,
      'order_status',
      'Commande mise à jour',
      `Votre commande est maintenant : ${STATUS_LABEL_FR[status]}`,
      '/commandes',
    );
    return saved;
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto) {
    const commissionRate = await this.platformConfig.getValue('commissionRate');

    // Override price if there is an accepted offer
    if (dto.offerId) {
      const offer = await this.offersRepo.findOne({ where: { id: dto.offerId } });
      if (offer && offer.buyerId === userId && offer.status === 'accepted') {
        const item = dto.items.find((i) => i.productId === offer.productId);
        if (item) {
          item.unitPrice = parseFloat(offer.suggestedPrice as any);
        }
      }
    }

    let sellerId: string | null = null;
    if (dto.items.length > 0) {
      const firstProduct = await this.productsRepo.findOne({ where: { id: dto.items[0].productId } });
      sellerId = firstProduct?.sellerId ?? null;
    }

    // Recalculate subtotal using potentially overridden item unitPrices
    const subtotal = dto.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const discount = dto.discount ?? 0;
    const shippingFee = dto.shippingFee ?? 0;
    const totalEur = Math.max(0, subtotal - discount + shippingFee);

    const platformFee = sellerId ? Math.round((totalEur * commissionRate) / 100 * 100) / 100 : 0;
    const sellerPayout = sellerId ? Math.round((totalEur - platformFee) * 100) / 100 : 0;

    const order = this.ordersRepo.create({
      ...dto,
      discount,
      userId,
      sellerId,
      platformFee,
      sellerPayout,
      shippingFee,
      carrierName: dto.carrierName ?? '',
      currency: dto.currency ?? 'EUR',
      exchangeRate: dto.exchangeRate ?? 1.0,
      payoutStatus: 'pending',
      status: 'pending',
    });

    const saved = await this.ordersRepo.save(order);
    await this.historyRepo.save(this.historyRepo.create({ orderId: saved.id, status: 'pending', note: 'Commande créée (attente paiement).' }));

    const finalAmountInCurrency = Math.max(0, totalEur * (dto.exchangeRate ?? 1.0));
    
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        finalAmountInCurrency,
        dto.currency ?? 'EUR',
        {
          orderId: saved.id,
          userId,
        },
      );

      saved.stripePaymentIntentId = paymentIntent.id;
      await this.ordersRepo.save(saved);

      return {
        clientSecret: paymentIntent.clientSecret,
        orderId: saved.id,
        isMock: paymentIntent.isMock,
      };
    } catch (err) {
      saved.status = 'cancelled';
      await this.ordersRepo.save(saved);
      throw new BadRequestException(`Erreur lors de l'initialisation du paiement Stripe: ${(err as any).message}`);
    }
  }

  async confirmReceipt(orderId: string, userId: string) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId) throw new BadRequestException('Vous n\'êtes pas l\'acheteur de cette commande');
    if (order.buyerConfirmed) throw new BadRequestException('Commande déjà confirmée');
    if (order.status !== 'shipped' && order.status !== 'paid') {
      throw new BadRequestException('Le colis doit être expédié avant d\'être confirmé');
    }

    order.buyerConfirmed = true;
    order.status = 'delivered';
    const saved = await this.ordersRepo.save(order);

    await this.historyRepo.save(this.historyRepo.create({ orderId, status: 'delivered', note: 'Acheteur a confirmé la réception (Tout est OK).' }));

    if (order.sellerId && order.sellerPayout > 0) {
      const seller = await this.usersRepo.findOne({ where: { id: order.sellerId } });
      if (seller) {
        const currentBalance = parseFloat(seller.walletBalance as any) || 0;
        seller.walletBalance = Math.round((currentBalance + order.sellerPayout) * 100) / 100;
        await this.usersRepo.save(seller);

        await this.notificationsService.create(
          order.sellerId,
          'seller_status',
          'Fonds libérés',
          `Les fonds de ${order.sellerPayout.toFixed(2)} € ont été crédités sur votre portefeuille.`,
          '/portefeuille',
        );
      }
    }

    await this.notificationsService.create(
      order.userId,
      'order_status',
      'Transaction finalisée',
      'Merci d\'avoir confirmé la réception. La transaction est terminée !',
      '/commandes',
    );

    return saved;
  }
}
