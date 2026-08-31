import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('shipping_zones')
export class ShippingZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nom affiché ex: "France", "Amériques", "Europe" */
  @Column()
  name: string;

  /** Transporteur affiché ex: "DHL Express", "Colissimo" */
  @Column({ default: '' })
  carrier: string;

  /**
   * Liste des codes ISO 3166-1 alpha-2 couverts par cette zone.
   * Tableau vide = zone globale (fallback si aucune autre zone ne correspond).
   */
  @Column({ type: 'jsonb', default: [] })
  countryCodes: string[];

  /** Prix fixe de la livraison en EUR */
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, transformer: {
    to: (v: number) => v,
    from: (v: string) => parseFloat(v) || 0,
  }})
  basePrice: number;

  /**
   * Seuil de commande (en EUR) à partir duquel la livraison est gratuite.
   * null = jamais gratuite.
   */
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true, transformer: {
    to: (v: number | null) => v,
    from: (v: string | null) => v !== null ? parseFloat(v) : null,
  }})
  freeThreshold: number | null;

  /** Délai estimé minimum (jours ouvrés) */
  @Column({ type: 'int', default: 2 })
  estimatedDaysMin: number;

  /** Délai estimé maximum (jours ouvrés) */
  @Column({ type: 'int', default: 7 })
  estimatedDaysMax: number;

  /** Ordre d'affichage dans la liste */
  @Column({ type: 'int', default: 99 })
  sortOrder: number;

  /** Zone activée ou non */
  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
