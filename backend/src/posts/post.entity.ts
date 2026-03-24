import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('posts')
@Index('idx_posts_published_created', ['published', 'created_at'])
@Index('idx_posts_category', ['category'])
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

  @Column({ length: 100, nullable: true })
  category: string;

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
