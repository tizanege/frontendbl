import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../services/billing.service';

@Injectable()
export class PlanGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private billingService: BillingService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
        if (!requiredFeature) return true;

        const request = context.switchToHttp().getRequest();
        const tenantId = request.user?.tenantId || request.headers['x-tenant-id'] || 'default-tenant';

        const sub = await this.billingService.getSubscriptionByTenant(tenantId);
        if (!sub) {
            throw new ForbiddenException('Subscription required');
        }

        const isActive = ['active', 'trial'].includes(sub.status);
        if (!isActive) {
            throw new ForbiddenException('Your subscription is not active');
        }

        const plan = sub.plan;

        // Feature checks
        if (requiredFeature === 'workflow' && !plan.workflow_enabled) {
            throw new ForbiddenException('Premium plan required for workflows');
        }

        if (requiredFeature === 'geo' && !plan.geo_enabled) {
            throw new ForbiddenException('Business plan required for Geo analytics');
        }

        return true;
    }
}
