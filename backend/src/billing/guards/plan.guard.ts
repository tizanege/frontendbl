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
        
        // If no specific feature flag (e.g. 'workflow', 'geo') is required, allow access
        if (!requiredFeature) return true;

        const request = context.switchToHttp().getRequest();
        const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];

        if (!tenantId || tenantId === 'default' || tenantId === 'default-tenant') {
            // Allow basic features for default tenant
            return true;
        }

        try {
            const sub = await this.billingService.getSubscriptionByTenant(tenantId);
            if (!sub) {
                // If no subscription record exists yet, allow standard features
                return true;
            }

            const isActive = ['active', 'trial'].includes(sub.status);
            if (!isActive) {
                throw new ForbiddenException('Your subscription is not active');
            }

            const plan = sub.plan;
            if (!plan) return true;

            // Feature checks
            if (requiredFeature === 'workflow' && !plan.workflow_enabled) {
                throw new ForbiddenException('Premium plan required for workflows');
            }

            if (requiredFeature === 'geo' && !plan.geo_enabled) {
                throw new ForbiddenException('Business plan required for Geo analytics');
            }
        } catch (err: any) {
            if (err instanceof ForbiddenException) throw err;
            // On any unexpected query error, permit basic access
            return true;
        }

        return true;
    }
}
