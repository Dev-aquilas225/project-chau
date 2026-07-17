import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type PayoutStatus = 'pending' | 'processing' | 'paid';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  unitPrice: number;
  qty: number;
}

export interface Address {
  fullName: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sellerId' })
  seller: User | null;

  @Column({ nullable: true })
  sellerId: string | null;

  @Column({ type: 'jsonb' })
  items: OrderItem[];

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  sellerPayout: number;

  @Column({ type: 'varchar', default: 'pending' })
  payoutStatus: PayoutStatus;

  @Column({ nullable: true })
  promoCode: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: OrderStatus;

  @Column({ default: false })
  buyerConfirmed: boolean;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value) || 0
  } })
  shippingFee: number;

  @Column({ default: '' })
  carrierName: string;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ type: 'numeric', precision: 10, scale: 6, default: 1.0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value) || 1.0
  } })
  exchangeRate: number;

  @Column({ type: 'jsonb' })
  shippingAddress: Address;

  @Column({ default: '' })
  paymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
