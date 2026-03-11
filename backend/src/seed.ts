import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Plan } from './billing/entities/plan.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const planRepo = dataSource.getRepository(Plan);

    const plans = [
        {
            name: 'Free',
            price_monthly: 0,
            price_yearly: 0,
            submission_limit: 100,
            user_limit: 1,
            workflow_enabled: false,
            geo_enabled: false,
        },
        {
            name: 'Pro',
            price_monthly: 29,
            price_yearly: 290,
            submission_limit: 5000,
            user_limit: 5,
            workflow_enabled: true,
            geo_enabled: false,
        },
        {
            name: 'Business',
            price_monthly: 99,
            price_yearly: 990,
            submission_limit: 1000000,
            user_limit: 100,
            workflow_enabled: true,
            geo_enabled: true,
        },
    ];

    console.log('Seeding plans...');
    for (const p of plans) {
        const existing = await planRepo.findOne({ where: { name: p.name } });
        if (!existing) {
            await planRepo.save(planRepo.create(p));
            console.log(`- Created plan: ${p.name}`);
        } else {
            console.log(`- Plan ${p.name} already exists`);
        }
    }

    console.log('Seeding complete.');
    await app.close();
}
bootstrap();
