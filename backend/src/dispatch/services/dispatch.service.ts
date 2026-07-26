import { Injectable, Inject, Scope, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispatch, DispatchStatus } from '../entities/dispatch.entity';
import { TenantContext } from '../../common/context/tenant.context';

@Injectable()
export class DispatchService {
    constructor(
        @InjectRepository(Dispatch)
        private dispatchRepository: Repository<Dispatch>,
        private tenantContext: TenantContext,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.tenantId;
    }

    async create(data: any): Promise<Dispatch> {
        const dispatch = this.dispatchRepository.create({
            ...data,
            tenant_id: this.tenantId,
            status: DispatchStatus.ASSIGNED,
        });
        const saved = await this.dispatchRepository.save(dispatch);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(): Promise<Dispatch[]> {
        const tid = this.tenantId;
        if (!tid) return [];
        return this.dispatchRepository.find({
            where: { tenant_id: tid },
            relations: ['form', 'assigned_to'],
            order: { created_at: 'DESC' },
        });
    }

    async findByAssignee(userId: string): Promise<Dispatch[]> {
        const tid = this.tenantId;
        if (!tid) return [];
        return this.dispatchRepository.find({
            where: {
                tenant_id: tid,
                assigned_to_id: userId,
            },
            relations: ['form'],
            order: { scheduled_at: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Dispatch> {
        return this.dispatchRepository.findOne({
            where: { id, tenant_id: this.tenantId },
            relations: ['form'],
        });
    }

    async updateStatus(id: string, status: DispatchStatus): Promise<Dispatch> {
        const dispatch = await this.dispatchRepository.findOne({
            where: { id, tenant_id: this.tenantId },
        });
        if (!dispatch) throw new Error('Dispatch not found');
        dispatch.status = status;
        return this.dispatchRepository.save(dispatch);
    }

    async getStats() {
        const tid = this.tenantId;
        if (!tid) return { total: 0, pending: 0, in_progress: 0, completed: 0 };
        const dispatches = await this.dispatchRepository.find({
            where: { tenant_id: tid },
        });

        return {
            total: dispatches.length,
            pending: dispatches.filter(d => d.status === DispatchStatus.ASSIGNED).length,
            in_progress: dispatches.filter(d => d.status === DispatchStatus.STARTED).length,
            completed: dispatches.filter(d => d.status === DispatchStatus.COMPLETED).length,
        };
    }
}
