import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Form } from '../../forms/entities/form.entity';
import { User } from '../../users/entities/user.entity';

export enum DispatchStatus {
    PENDING = 'pending',
    ASSIGNED = 'assigned',
    STARTED = 'started',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('dispatches')
export class Dispatch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    form_id: string;

    @ManyToOne(() => Form)
    @JoinColumn({ name: 'form_id' })
    form: Form;

    @Column()
    @Index()
    assigned_to_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assigned_to_id' })
    assigned_to: User;

    @Column({
        type: 'enum',
        enum: DispatchStatus,
        default: DispatchStatus.PENDING,
    })
    status: DispatchStatus;

    @Column({ nullable: true })
    scheduled_at: Date;

    @Column({ nullable: true })
    location_name: string;

    @Column({ type: 'jsonb', nullable: true })
    pre_filled_data: any;

    @Column({ nullable: true })
    notes: string;

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
}
