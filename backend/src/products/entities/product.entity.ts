import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  brand: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ nullable: true })
  categoryId: string | null;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  condition: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  weLove: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
