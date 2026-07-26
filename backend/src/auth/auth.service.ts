import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Subscription, SubscriptionStatus } from '../billing/entities/subscription.entity';
import { Plan } from '../billing/entities/plan.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,
        private jwtService: JwtService,
        private dataSource: DataSource,
    ) { }

    async register(registrationData: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { firstName, lastName, email, password, companyName } = registrationData;

            // 1. Create Tenant
            const slug = companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const tenant = queryRunner.manager.create(Tenant, {
                name: companyName,
                slug,
            });
            const savedTenant = await queryRunner.manager.save(Tenant, tenant);

            // 2. Create Admin User
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = queryRunner.manager.create(User, {
                first_name: firstName,
                last_name: lastName,
                email,
                password: hashedPassword,
                tenant_id: savedTenant.id,
                role: UserRole.ADMIN,
            });
            const savedUser = await queryRunner.manager.save(User, user);

            // 3. Setup Default Free Subscription
            const freePlan = await queryRunner.manager.findOne(Plan, { where: { price_monthly: 0 } });
            if (freePlan) {
                const sub = queryRunner.manager.create(Subscription, {
                    tenant_id: savedTenant.id,
                    plan_id: freePlan.id,
                    status: SubscriptionStatus.ACTIVE,
                });
                await queryRunner.manager.save(Subscription, sub);
            }

            await queryRunner.commitTransaction();
            return this.generateToken(savedUser);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            if (err.code === '23505') { // Postgres unique violation
                throw new ConflictException('Email or Company Name already exists');
            }
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async login(credentials: any) {
        const { email, password } = credentials;
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'tenant_id', 'role'] // Include password for validation
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateToken(user);
    }

    private generateToken(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenant_id,
            role: user.role
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
            }
        };
    }
}
