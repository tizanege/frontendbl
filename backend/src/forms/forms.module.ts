import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { Submission } from './entities/submission.entity';
import { FormsService } from './services/forms.service';
import { FormsController } from './controllers/forms.controller';
import { BillingModule } from '../billing/billing.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Form, Submission]),
        BillingModule,
        forwardRef(() => DispatchModule),
    ],
    controllers: [FormsController],
    providers: [FormsService],
})
export class FormsModule { }
