import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY')!;
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getClient() {
        return this.supabase;
    }

    async verifyToken(token: string) {
        const { data, error } = await this.supabase.auth.getUser(token);
        if (error || !data.user) {
            return null;
        }
        return data.user;
    }
}
