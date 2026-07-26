import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
    private _tenantId: string;

    set tenantId(id: string) {
        this._tenantId = id;
    }

    get tenantId(): string {
        return this._tenantId;
    }
}
