import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(private tenantContext: TenantContext) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.tenantId) {
            // Basic UUID validation to prevent DB crashes (500 errors)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (user.tenantId !== 'system' && !uuidRegex.test(user.tenantId)) {
                // If it's invalid, we don't throw yet, but we set a safe null or throw if it's a required field for this route
                // For now, let's just log or set to something that won't crash Postgres if handled
                this.tenantContext.tenantId = null;
            } else {
                this.tenantContext.tenantId = user.tenantId;
            }
        }

        return next.handle();
    }
}
