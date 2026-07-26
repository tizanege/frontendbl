import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class PaystackService {
    private readonly logger = new Logger(PaystackService.name);
    private readonly client: AxiosInstance;

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
        this.client = axios.create({
            baseURL: 'https://api.paystack.co',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    async initializeTransaction(email: string, amount: number, metadata: any) {
        try {
            const response = await this.client.post('/transaction/initialize', {
                email,
                amount: Math.round(amount * 100), // Paystack expects amount in kobo
                metadata,
            });
            return response.data.data;
        } catch (error: any) {
            this.logger.error('Error initializing Paystack transaction', error.response?.data || error.message);
            throw error;
        }
    }

    async verifyTransaction(reference: string) {
        try {
            const response = await this.client.get(`/transaction/verify/${reference}`);
            return response.data.data;
        } catch (error: any) {
            this.logger.error('Error verifying Paystack transaction', error.response?.data || error.message);
            throw error;
        }
    }

    async createSubscription(customer: string, plan: string) {
        try {
            const response = await this.client.post('/subscription', {
                customer,
                plan,
            });
            return response.data.data;
        } catch (error: any) {
            this.logger.error('Error creating Paystack subscription', error.response?.data || error.message);
            throw error;
        }
    }
}
