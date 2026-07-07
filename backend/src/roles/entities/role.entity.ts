import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ResourceKey =
  | 'products'
  | 'categories'
  | 'orders'
  | 'users'
  | 'promoCodes'
  | 'sellers'
  | 'platformConfig';

// Modèle inspiré de Filament Shield : chaque ressource accorde une liste d'actions,
// plutôt qu'un niveau unique none/view/manage.
export type PermissionAction = 'view_any' | 'view' | 'create' | 'update' | 'delete';

export const RESOURCE_KEYS: ResourceKey[] = [
  'products',
  'categories',
  'orders',
  'users',
  'promoCodes',
  'sellers',
  'platformConfig',
];

export const PERMISSION_ACTIONS: PermissionAction[] = ['view_any', 'view', 'create', 'update', 'delete'];

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  permissions: Partial<Record<ResourceKey, PermissionAction[]>>;

  // Rôles de base ("Admin", "Client") : non supprimables et non renommables.
  @Column({ default: false })
  isSystem: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
