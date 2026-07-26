import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { BillingEvent } from '../entities/billing-event.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(
        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(BillingEvent)
        private eventRepository: Repository<BillingEvent>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    async getBillingDetails(tenantId: string) {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return {
            billing_email: tenant.billing_email,
            billing_name: tenant.billing_name,
            billing_address: tenant.billing_address,
            billing_city: tenant.billing_city,
            billing_state: tenant.billing_state,
            billing_zip: tenant.billing_zip,
            tax_id: tenant.tax_id,
            sector: tenant.sector,
        };
    }

    async updateBillingDetails(tenantId: string, data: any) {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        Object.assign(tenant, {
            billing_email: data.billing_email,
            billing_name: data.billing_name,
            billing_address: data.billing_address,
            billing_city: data.billing_city,
            billing_state: data.billing_state,
            billing_zip: data.billing_zip,
            tax_id: data.tax_id,
            sector: data.sector,
        });

        return this.tenantRepository.save(tenant);
    }

    async getPlans() {
        return this.planRepository.find({ where: { is_active: true } });
    }

    async getSubscriptionByTenant(tenantId: string) {
        const sub = await this.subscriptionRepository.findOne({
            where: { tenant_id: tenantId },
            relations: ['plan'],
        });
        if (!sub) {
            // Create a default free plan subscription if none exists
            return this.initFreeSubscription(tenantId);
        }
        return sub;
    }

    private async initFreeSubscription(tenantId: string) {
        if (!tenantId) return null;
        const freePlan = await this.planRepository.findOne({ where: { price_monthly: 0 } });
        if (!freePlan) return null;

        const sub = this.subscriptionRepository.create({
            tenant_id: tenantId,
            plan_id: freePlan.id,
            plan: freePlan,
            status: SubscriptionStatus.ACTIVE,
        });
        return this.subscriptionRepository.save(sub);
    }

    async handleWebhook(eventType: string, payload: any) {
        const tenantId = payload.data?.metadata?.tenant_id || 'system';

        // Log event
        await this.eventRepository.save({
            tenant_id: tenantId,
            event_type: eventType,
            raw_payload: payload,
        });

        this.logger.log(`Processing Paystack event: ${eventType} for tenant: ${tenantId}`);

        try {
            if (eventType === 'subscription.create' || eventType === 'charge.success') {
                await this.processSuccessfulPayment(payload.data);
            } else if (eventType === 'subscription.disable') {
                await this.processSubscriptionCancellation(payload.data);
            } else if (eventType === 'invoice.payment_failed') {
                await this.processPaymentFailure(payload.data);
            }
        } catch (error) {
            this.logger.error(`Error processing webhook ${eventType}`, error);
        }
    }

    async getBillingHistory(tenantId: string) {
        return this.eventRepository.find({
            where: { tenant_id: tenantId, event_type: 'charge.success' },
            order: { processed_at: 'DESC' },
        });
    }

    private async processSuccessfulPayment(data: any) {
        const tenantId = data.metadata?.tenant_id;
        if (!tenantId) return;

        let sub = await this.subscriptionRepository.findOne({ where: { tenant_id: tenantId } });
        if (sub) {
            sub.status = SubscriptionStatus.ACTIVE;
            if (data.subscription_code) sub.paystack_subscription_code = data.subscription_code;
            if (data.customer?.customer_code) sub.paystack_customer_code = data.customer.customer_code;

            // Update dates if available
            if (data.next_payment_date) sub.next_billing_date = new Date(data.next_payment_date);

            await this.subscriptionRepository.save(sub);
        }
    }

    private async processSubscriptionCancellation(data: any) {
        const tenantId = data.metadata?.tenant_id;
        if (!tenantId) return;

        const sub = await this.subscriptionRepository.findOne({ where: { tenant_id: tenantId } });
        if (sub) {
            sub.status = SubscriptionStatus.CANCELED;
            await this.subscriptionRepository.save(sub);
        }
    }

    private async processPaymentFailure(data: any) {
        const tenantId = data.metadata?.tenant_id;
        if (!tenantId) return;

        const sub = await this.subscriptionRepository.findOne({ where: { tenant_id: tenantId } });
        if (sub) {
            sub.status = SubscriptionStatus.PAST_DUE;
            await this.subscriptionRepository.save(sub);
        }
    }
}
