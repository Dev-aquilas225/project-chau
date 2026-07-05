import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Role as CustomRole } from '../../roles/entities/role.entity';

export type Role = 'customer' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type IdType = 'national_id' | 'passport';

export interface SellerProfile {
  storeName?: string;
  bio?: string;
  iban?: string;
  idType?: IdType;
  idNumber?: string;
  idCountry?: string; // ISO 3166-1 alpha-2
  fullNameOnId?: string;
  dateOfBirth?: string; // ISO date YYYY-MM-DD
  idDocumentRef?: string; // nom de fichier interne, dossier privé, PAS une URL publique — recto pour une CNI, page photo pour un passeport
  idDocumentBackRef?: string; // verso de la CNI (national_id uniquement), idem
  profilePhotoRef?: string; // idem
  submittedAt?: string; // ISO datetime
  verifiedAt?: string; // ISO datetime, fixé uniquement à l'approbation admin
  reviewNote?: string; // motif optionnel saisi par l'admin (approbation ou rejet)
  reviewedAt?: string; // ISO datetime de la décision admin
}

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

  @Column({ type: 'varchar', default: 'none' })
  sellerStatus: SellerStatus;

  @Column({ type: 'jsonb', default: {} })
  sellerProfile: SellerProfile;

  @Column({ type: 'jsonb', default: [] })
  addresses: Record<string, unknown>[];

  @Column({ type: 'varchar', nullable: true })
  photoURL?: string;

  // "À propos de toi" — profil public, distinct de sellerProfile.bio (bio de la boutique vendeur, module sellers).
  @Column({ type: 'varchar', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @ManyToOne(() => CustomRole, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customRoleId' })
  customRole: CustomRole | null;

  @Column({ nullable: true })
  customRoleId: string | null;

  @Column({ default: false })
  blocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  blockedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  blockReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
