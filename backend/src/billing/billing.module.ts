import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { BillingEvent } from './entities/billing-event.entity';
import { BillingService } from './services/billing.service';
import { BillingController } from './controllers/billing.controller';
import { WebhookController } from './controllers/webhook.controller';
import { PaystackModule } from '../paystack/paystack.module';
import { Tenant } from '../tenants/entities/tenant.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Plan, Subscription, BillingEvent, Tenant]),
        PaystackModule,
    ],
    controllers: [BillingController, WebhookController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule { }
