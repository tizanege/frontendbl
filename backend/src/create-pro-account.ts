import { AppDataSource } from './data-source';
import { User, UserRole } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { Plan } from './billing/entities/plan.entity';
import { Subscription, SubscriptionStatus } from './billing/entities/subscription.entity';
import * as bcrypt from 'bcrypt';

async function run() {
    console.log('--- Pro Account Creation Script (Standalone) ---');

    try {
        await AppDataSource.initialize();
        console.log('Database initialized.');

        const email = 'pro_team@bleshforms.com';
        const password = 'ProPassword2026!';
        const companyName = 'Blesh Pro Team';

        const userRepo = AppDataSource.getRepository(User);
        const tenantRepo = AppDataSource.getRepository(Tenant);
        const planRepo = AppDataSource.getRepository(Plan);
        const subRepo = AppDataSource.getRepository(Subscription);

        // 1. Check if user exists
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) {
            console.log(`User ${email} already exists.`);
            return;
        }

        // 2. Find Pro Plan
        const proPlan = await planRepo.findOne({ where: { name: 'Pro' } });
        if (!proPlan) {
            console.log('Pro plan not found. Please run seed script first.');
            return;
        }

        // 3. Create Tenant
        const slug = companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const tenant = tenantRepo.create({
            name: companyName,
            slug,
        });
        const savedTenant = await tenantRepo.save(tenant);
        console.log(`Created Tenant: ${savedTenant.name} (${savedTenant.id})`);

        // 4. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepo.create({
            first_name: 'Pro',
            last_name: 'Lead',
            email,
            password: hashedPassword,
            tenant_id: savedTenant.id,
            role: UserRole.ADMIN,
        });
        const savedUser = await userRepo.save(user);
        console.log(`Created User: ${savedUser.email} (${savedUser.id})`);

        // 5. Create Subscription
        const now = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(now.getFullYear() + 1);

        const sub = subRepo.create({
            tenant_id: savedTenant.id,
            plan_id: proPlan.id,
            status: SubscriptionStatus.ACTIVE,
            current_period_start: now,
            current_period_end: nextYear,
            next_billing_date: nextYear,
        });
        await subRepo.save(sub);
        console.log(`Created Pro Subscription for 1 year (Expires: ${nextYear.toDateString()})`);

        console.log('--- Account Created Successfully ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error('Error creating account:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
