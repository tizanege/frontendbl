import { Module, Global } from '@nestjs/common';
import { TenantContext } from './context/tenant.context';

@Global()
@Module({
    providers: [TenantContext],
    exports: [TenantContext],
})
export class CommonModule { }
