import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export type Role = 'customer' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  displayName: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'varchar', default: 'customer' })
  role: Role;

  @Column({ type: 'jsonb', default: [] })
  addresses: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
