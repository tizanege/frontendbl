import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Form } from './form.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('submissions')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    form_id: string;

    @ManyToOne(() => Form)
    @JoinColumn({ name: 'form_id' })
    form: Form;

    @Column({ type: 'jsonb' })
    data: any; // The captured form data

    @Column({ type: 'jsonb', nullable: true })
    location: { lat: number, lng: number }; // For Geo analytics

    @Column()
    tenant_id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ nullable: true })
    captured_by_user_id: string;

    @Index()
    @CreateDateColumn()
    submitted_at: Date;
}
