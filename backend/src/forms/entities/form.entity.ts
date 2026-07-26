import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Submission } from './submission.entity';

@Entity('forms')
export class Form {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'jsonb' })
    schema: any; // Dynamic JSON schema for form fields

    @Column({ default: 'draft' })
    status: string; // 'draft' | 'published'

    @Column({ default: 1 })
    version: number;

    @Column({ default: true })
    is_active: boolean;

    @Column()
    @Index()
    tenant_id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Submission, (submission) => submission.form)
    submissions: Submission[];
}
