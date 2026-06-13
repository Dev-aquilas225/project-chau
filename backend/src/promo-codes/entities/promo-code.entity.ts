import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type DiscountType = 'percentage' | 'fixed';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar' })
  discountType: DiscountType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
