import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ResourceKey =
  | 'products'
  | 'categories'
  | 'orders'
  | 'users'
  | 'promoCodes'
  | 'sellers'
  | 'platformConfig';

export type PermissionLevel = 'none' | 'view' | 'manage';

export const RESOURCE_KEYS: ResourceKey[] = [
  'products',
  'categories',
  'orders',
  'users',
  'promoCodes',
  'sellers',
  'platformConfig',
];

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  permissions: Partial<Record<ResourceKey, PermissionLevel>>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
