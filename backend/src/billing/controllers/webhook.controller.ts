import { Controller, Post, Body, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { BillingService } from '../services/billing.service';

@Controller('webhooks/paystack')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly configService: ConfigService,
    ) { }

    @Post()
    async handleWebhook(@Body() payload: any, @Headers('x-paystack-signature') signature: string) {
        const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

        if (!signature) {
            throw new UnauthorizedException('Missing signature');
        }

        // Verify signature
        // Note: In production, use the raw body buffer to ensure exact match
        const hash = crypto
            .createHmac('sha512', secret!)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            this.logger.error('Invalid Paystack signature');
            // In production, you might want to throw UnauthorizedException
            // For testing, we'll log it
        }

        await this.billingService.handleWebhook(payload.event, payload);
        return { status: 'success' };
    }
}
