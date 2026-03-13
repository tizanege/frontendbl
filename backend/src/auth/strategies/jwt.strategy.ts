import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private supabaseService: SupabaseService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // We use a dummy secret because we verify the token manually via Supabase API
            secretOrKey: configService.get<string>('JWT_SECRET') || 'supabase_secret_placeholder',
        });
    }

    async validate(payload: any, done: Function) {
        // payload is still decoded by the strategy, but we can't trust it if the secret is wrong.
        // However, if we don't have the secret, the strategy will fail before reaching validate.
        // So we need a way to bypass internal verification or use a different strategy.
        return payload;
    }

    // Override the authenticate method to use Supabase
    async authenticate(req: any, options?: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) {
            return this.fail(new UnauthorizedException('No token provided'), 401);
        }

        const user = await this.supabaseService.verifyToken(token);
        if (!user) {
            return this.fail(new UnauthorizedException('Invalid token'), 401);
        }

        (req as any).user = {
            userId: user.id,
            email: user.email,
            tenantId: user.user_metadata.tenantId || 'default',
            role: user.user_metadata.role || 'user'
        };

        return this.success((req as any).user);
    }
}
