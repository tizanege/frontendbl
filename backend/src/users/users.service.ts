import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { TenantContext } from '../common/context/tenant.context';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private tenantContext: TenantContext,
    ) { }

    async getTeamMembers() {
        const tenantId = this.tenantContext.tenantId;
        return this.userRepository.find({
            where: { tenant_id: tenantId },
            select: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active', 'created_at'],
            order: { created_at: 'ASC' },
        });
    }

    async inviteTeamMember(data: { firstName: string; lastName: string; email: string; role: UserRole }) {
        const tenantId = this.tenantContext.tenantId;

        const existing = await this.userRepository.findOne({ where: { email: data.email } });
        if (existing) throw new ConflictException('A user with this email already exists.');

        // Generate a temporary password (in production, send a magic link)
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const user = this.userRepository.create({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: data.role || UserRole.FIELD_OPERATIVE,
            tenant_id: tenantId,
            is_active: true,
        });

        const saved = await this.userRepository.save(user);

        // In production, send an email with the invite link
        return {
            id: saved.id,
            email: saved.email,
            role: saved.role,
            tempPassword, // Return for now (remove in production — use email invite instead)
            message: 'Team member invited successfully.',
        };
    }

    async updateMemberRole(id: string, role: UserRole) {
        const tenantId = this.tenantContext.tenantId;
        const user = await this.userRepository.findOne({ where: { id, tenant_id: tenantId } });
        if (!user) throw new NotFoundException('User not found or not in your organization.');
        user.role = role;
        await this.userRepository.save(user);
        return { success: true, message: 'Role updated.' };
    }

    async deactivateMember(id: string) {
        const tenantId = this.tenantContext.tenantId;
        const user = await this.userRepository.findOne({ where: { id, tenant_id: tenantId } });
        if (!user) throw new NotFoundException('User not found or not in your organization.');
        user.is_active = false;
        await this.userRepository.save(user);
        return { success: true, message: 'Team member deactivated.' };
    }

    async getTeamStats() {
        const tenantId = this.tenantContext.tenantId;
        const total = await this.userRepository.count({ where: { tenant_id: tenantId } });
        const active = await this.userRepository.count({ where: { tenant_id: tenantId, is_active: true } });
        const admins = await this.userRepository.count({ where: { tenant_id: tenantId, role: UserRole.ADMIN } });
        const operatives = await this.userRepository.count({ where: { tenant_id: tenantId, role: UserRole.FIELD_OPERATIVE } });

        return { total, active, admins, operatives };
    }
}
