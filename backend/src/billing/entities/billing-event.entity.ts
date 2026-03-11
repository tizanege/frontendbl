import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('billing_events')
export class BillingEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenant_id: string;

    @Column()
    event_type: string;

    @Column({ type: 'jsonb' })
    raw_payload: any;

    @CreateDateColumn()
    processed_at: Date;
}
