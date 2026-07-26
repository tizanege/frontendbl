import { AppDataSource } from './data-source';
import { User, UserRole } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { Plan } from './billing/entities/plan.entity';
import { Subscription, SubscriptionStatus } from './billing/entities/subscription.entity';
import * as bcrypt from 'bcrypt';

async function run() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email as an argument.');
        console.log('Usage: npx ts-node -r tsconfig-paths/register src/promote-to-pro.ts <email>');
        process.exit(1);
    }

    console.log(`--- Promoting ${email} to Pro Plan ---`);

    try {
        await AppDataSource.initialize();
        console.log('Database initialized.');

        const userRepo = AppDataSource.getRepository(User);
        const tenantRepo = AppDataSource.getRepository(Tenant);
        const planRepo = AppDataSource.getRepository(Plan);
        const subRepo = AppDataSource.getRepository(Subscription);

        // 1. Find User
        let user = await userRepo.findOne({ where: { email } });
        
        if (!user) {
            console.log(`User ${email} not found in local DB. Creating temporary profile...`);
            
            // Create a default tenant for this user
            const companyName = email.split('@')[0] + "'s Organization";
            const slug = companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            
            const tenant = tenantRepo.create({
                name: companyName,
                slug,
            });
            const savedTenant = await tenantRepo.save(tenant);
            console.log(`Created Tenant: ${savedTenant.name}`);

            // Create the user record
            const hashedPassword = await bcrypt.hash('ProTempPass123!', 10);
            user = userRepo.create({
                first_name: email.split('@')[0],
                last_name: 'User',
                email,
                password: hashedPassword,
                tenant_id: savedTenant.id,
                role: UserRole.ADMIN,
            });
            user = await userRepo.save(user);
            console.log(`Created local user record for: ${email}`);
        }

        console.log(`Target User: ${user.first_name} ${user.last_name} (Tenant: ${user.tenant_id})`);

        // 2. Find Pro Plan
        const proPlan = await planRepo.findOne({ where: { name: 'Pro' } });
        if (!proPlan) {
            console.error('Pro plan not found in database. Please run seed script first.');
            return;
        }

        // 3. Find or Create Subscription
        let sub = await subRepo.findOne({ where: { tenant_id: user.tenant_id } });
        
        const now = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(now.getFullYear() + 1);

        if (sub) {
            console.log(`Updating existing subscription (${sub.id})...`);
            sub.plan_id = proPlan.id;
            sub.status = SubscriptionStatus.ACTIVE;
            sub.current_period_start = now;
            sub.current_period_end = nextYear;
            sub.next_billing_date = nextYear;
        } else {
            console.log('Creating new Pro subscription...');
            sub = subRepo.create({
                tenant_id: user.tenant_id,
                plan_id: proPlan.id,
                status: SubscriptionStatus.ACTIVE,
                current_period_start: now,
                current_period_end: nextYear,
                next_billing_date: nextYear,
            });
        }

        await subRepo.save(sub);
        console.log(`Successfully promoted ${email} to Pro!`);
        console.log(`Plan: ${proPlan.name}`);
        console.log(`Expires: ${nextYear.toDateString()}`);

    } catch (err) {
        console.error('Error during promotion:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
