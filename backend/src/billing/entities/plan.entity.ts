import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price_monthly: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price_yearly: number;

  @Column({ default: 3 })
  submission_limit: number;

  @Column({ default: 1 })
  user_limit: number;

  @Column({ default: false })
  workflow_enabled: boolean;

  @Column({ default: false })
  geo_enabled: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
