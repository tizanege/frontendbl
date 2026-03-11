import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Subscription } from '../../billing/entities/subscription.entity';

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    @Index()
    slug: string;

    @Column({ nullable: true })
    sector: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    billing_email: string;

    @Column({ nullable: true })
    billing_name: string;

    @Column({ type: 'text', nullable: true })
    billing_address: string;

    @Column({ nullable: true })
    billing_city: string;

    @Column({ nullable: true })
    billing_state: string;

    @Column({ nullable: true })
    billing_zip: string;

    @Column({ nullable: true })
    tax_id: string;

    @OneToMany(() => User, (user) => user.tenant)
    users: User[];

    @OneToOne(() => Subscription, (sub) => sub.tenant_id)
    subscription: Subscription;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
