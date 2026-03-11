import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(private tenantContext: TenantContext) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.tenantId) {
            this.tenantContext.tenantId = user.tenantId;
        }

        return next.handle();
    }
}
