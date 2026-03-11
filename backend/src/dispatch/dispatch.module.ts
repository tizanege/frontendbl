import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispatch } from './entities/dispatch.entity';
import { Form } from '../forms/entities/form.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { DispatchService } from './services/dispatch.service';
import { DispatchController } from './controllers/dispatch.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dispatch, Form, User, Tenant]),
        BillingModule,
    ],
    controllers: [DispatchController],
    providers: [DispatchService],
    exports: [DispatchService],
})
export class DispatchModule { }
