import { AppDataSource } from './data-source';
import { User, UserRole } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { Plan } from './billing/entities/plan.entity';
import { Subscription, SubscriptionStatus } from './billing/entities/subscription.entity';
import * as bcrypt from 'bcrypt';

async function run() {
    const email = process.argv[2] || 'tiza@tutors.fi';
    const targetPlanName = process.argv[3] || 'Enterprise';

    console.log(`--- Promoting ${email} to ${targetPlanName} Plan ---`);

    try {
        await AppDataSource.initialize();
        console.log('Database initialized.');

        const userRepo = AppDataSource.getRepository(User);
        const tenantRepo = AppDataSource.getRepository(Tenant);
        const planRepo = AppDataSource.getRepository(Plan);
        const subRepo = AppDataSource.getRepository(Subscription);

        // 1. Ensure Target Plan exists (Enterprise / Business)
        let plan = await planRepo.findOne({ where: { name: targetPlanName } });
        if (!plan) {
            console.log(`Plan "${targetPlanName}" not found. Creating plan...`);
            plan = planRepo.create({
                name: targetPlanName,
                price_monthly: 299,
                price_yearly: 2990,
                submission_limit: 1000000,
                user_limit: 1000,
                workflow_enabled: true,
                geo_enabled: true,
                is_active: true,
            });
            plan = await planRepo.save(plan);
            console.log(`Created Plan: ${plan.name}`);
        }

        // 2. Find or Create User
        let user = await userRepo.findOne({ where: { email } });

        if (!user) {
            console.log(`User ${email} not found in local DB. Creating tenant and user profile...`);

            const companyName = email.split('@')[0] + "'s Enterprise";
            const slug = companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            let tenant = await tenantRepo.findOne({ where: { slug } });
            if (!tenant) {
                tenant = tenantRepo.create({
                    name: companyName,
                    slug,
                });
                tenant = await tenantRepo.save(tenant);
            }
            console.log(`Assigned Tenant: ${tenant.name} (${tenant.id})`);

            const hashedPassword = await bcrypt.hash('EnterprisePass123!', 10);
            user = userRepo.create({
                first_name: email.split('@')[0],
                last_name: 'Enterprise',
                email,
                password: hashedPassword,
                tenant_id: tenant.id,
                role: UserRole.ADMIN,
            });
            user = await userRepo.save(user);
            console.log(`Created user record for: ${email}`);
        }

        console.log(`User found: ${user.first_name} ${user.last_name} (ID: ${user.id}, Tenant: ${user.tenant_id})`);

        // 3. Find or Create Subscription for Tenant
        let sub = await subRepo.findOne({ where: { tenant_id: user.tenant_id } });

        const now = new Date();
        const tenYearsLater = new Date();
        tenYearsLater.setFullYear(now.getFullYear() + 10);

        if (sub) {
            console.log(`Updating existing tenant subscription (${sub.id})...`);
            sub.plan_id = plan.id;
            sub.status = SubscriptionStatus.ACTIVE;
            sub.current_period_start = now;
            sub.current_period_end = tenYearsLater;
            sub.next_billing_date = tenYearsLater;
        } else {
            console.log('Creating new Enterprise subscription for tenant...');
            sub = subRepo.create({
                tenant_id: user.tenant_id,
                plan_id: plan.id,
                status: SubscriptionStatus.ACTIVE,
                current_period_start: now,
                current_period_end: tenYearsLater,
                next_billing_date: tenYearsLater,
            });
        }

        await subRepo.save(sub);
        console.log(`\n✅ SUCCESSFULLY PROMOTED ${email} TO ${plan.name} LICENSE!`);
        console.log(`Plan Name: ${plan.name}`);
        console.log(`Tenant ID: ${user.tenant_id}`);
        console.log(`Subscription Status: ACTIVE`);
        console.log(`Expires: ${tenYearsLater.toDateString()}`);

    } catch (err) {
        console.error('Error during promotion:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
