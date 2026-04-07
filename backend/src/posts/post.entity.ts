import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('posts')
@Index('idx_posts_published_created', ['published', 'created_at'])
@Index('idx_posts_category_id', ['category_id'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column('longtext')
  content: string;

  @Column({ length: 500, nullable: true })
  summary: string;

  @Column({ nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  categoryEntity: Category;

  @Column('json', { nullable: true })
  tags: string[];

  @Column({ length: 500, nullable: true })
  thumbnail: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
