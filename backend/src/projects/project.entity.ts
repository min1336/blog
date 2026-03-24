import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column('longtext')
  description: string;

  @Column({ length: 500, nullable: true })
  summary: string;

  @Column('json', { nullable: true })
  tech_stack: string[];

  @Column({ length: 500, nullable: true })
  github_url: string;

  @Column({ length: 500, nullable: true })
  demo_url: string;

  @Column({ length: 500, nullable: true })
  thumbnail: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
