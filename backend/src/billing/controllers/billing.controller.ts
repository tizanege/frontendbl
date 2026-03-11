import { Controller, Get, Post, Body, Req, NotFoundException, UseGuards, UseInterceptors } from '@nestjs/common';
import { BillingService } from '../services/billing.service';
import { PaystackService } from '../../paystack/paystack.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../common/interceptors/tenant.interceptor';
import { TenantContext } from '../../common/context/tenant.context';

@Controller('billing')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly paystackService: PaystackService,
        private readonly tenantContext: TenantContext,
    ) { }

    @Get('plans')
    getPlans() {
        return this.billingService.getPlans();
    }

    @Get('subscription')
    getSubscription() {
        return this.billingService.getSubscriptionByTenant(this.tenantContext.tenantId);
    }

    @Get('details')
    getBillingDetails() {
        return this.billingService.getBillingDetails(this.tenantContext.tenantId);
    }

    @Post('details')
    updateBillingDetails(@Body() body: any) {
        return this.billingService.updateBillingDetails(this.tenantContext.tenantId, body);
    }

    @Get('history')
    getBillingHistory() {
        return this.billingService.getBillingHistory(this.tenantContext.tenantId);
    }

    @Post('checkout')
    async checkout(@Body() body: any) {
        const { planId, email } = body;
        const tenantId = this.tenantContext.tenantId;

        const plans = await this.billingService.getPlans();
        const plan = plans.find(p => p.id === planId);

        if (!plan) throw new NotFoundException('Plan not found');

        const metadata = {
            tenant_id: tenantId,
            plan_id: planId,
        };

        return this.paystackService.initializeTransaction(email, plan.price_monthly, metadata);
    }
}
