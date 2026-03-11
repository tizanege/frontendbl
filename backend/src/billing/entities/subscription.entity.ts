import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plan } from './plan.entity';

export enum SubscriptionStatus {
    TRIAL = 'trial',
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
}

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    tenant_id: string;

    @Column({ nullable: true })
    paystack_customer_code: string;

    @Column({ nullable: true })
    paystack_subscription_code: string;

    @Column()
    plan_id: string;

    @ManyToOne(() => Plan)
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.TRIAL,
    })
    status: SubscriptionStatus;

    @Column({ type: 'timestamp', nullable: true })
    current_period_start: Date;

    @Column({ type: 'timestamp', nullable: true })
    current_period_end: Date;

    @Column({ type: 'timestamp', nullable: true })
    next_billing_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
