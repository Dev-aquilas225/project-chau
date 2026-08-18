import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Jeton de connexion sans mot de passe (magic link). On stocke uniquement le hash
 * SHA-256 du jeton brut envoyé par email (jamais le jeton en clair en base), à usage
 * unique et à courte durée de vie.
 */
@Entity('magic_link_tokens')
export class MagicLinkToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Index({ unique: true })
  @Column()
  tokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
