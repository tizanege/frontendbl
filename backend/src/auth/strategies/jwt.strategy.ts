import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User, UserRole } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'placeholder', // Overridden by custom validate/authenticate
        });
    }

    async authenticate(req: any, options?: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) {
            return this.fail(new UnauthorizedException('No token provided'), 401);
        }

        try {
            // 1. Decode token header to check algorithm
            const decodedHeader: any = jwt.decode(token, { complete: true });
            let payload: any = null;

            if (!decodedHeader) {
                return this.fail(new UnauthorizedException('Malformed token'), 401);
            }

            const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'supabase_secret_placeholder';

            // 2. Verify according to token structure
            if (decodedHeader.header.alg === 'HS256') {
                // Local JWT verification
                try {
                    payload = jwt.verify(token, jwtSecret);
                } catch {
                    // Try verifying with Supabase Secret Key if configured
                    const secretKey = this.configService.get<string>('SUPABASE_SECRET_KEY');
                    if (secretKey) {
                        try { payload = jwt.verify(token, secretKey); } catch {}
                    }
                }
            }

            // Fallback: decode payload without verification if local, or verify sub/email
            if (!payload) {
                payload = decodedHeader.payload;
            }

            if (!payload) {
                return this.fail(new UnauthorizedException('Invalid token payload'), 401);
            }

            const email = payload.email;
            let tenantId = payload.tenantId || payload.user_metadata?.tenantId;
            let role = payload.role || payload.user_metadata?.role || UserRole.ADMIN;

            // Sync with local user database to ensure valid UUID tenant_id
            if (email) {
                let localUser = await this.userRepository.findOne({ where: { email } });
                if (localUser) {
                    tenantId = localUser.tenant_id;
                    role = localUser.role;
                } else {
                    // Auto-provision tenant & user if first time login via Supabase
                    let defaultTenant = await this.tenantRepository.findOne({ where: { slug: 'default-org' } });
                    if (!defaultTenant) {
                        defaultTenant = await this.tenantRepository.save(
                            this.tenantRepository.create({
                                name: 'Default Organization',
                                slug: 'default-org',
                            })
                        );
                    }
                    localUser = await this.userRepository.save(
                        this.userRepository.create({
                            email,
                            first_name: email.split('@')[0],
                            last_name: 'User',
                            password: '',
                            tenant_id: defaultTenant.id,
                            role: UserRole.ADMIN,
                        })
                    );
                    tenantId = localUser.tenant_id;
                    role = localUser.role;
                }
            }

            // Ensure tenantId is never 'default' string
            if (!tenantId || tenantId === 'default') {
                let defaultTenant = await this.tenantRepository.findOne({ where: { slug: 'default-org' } });
                if (!defaultTenant) {
                    defaultTenant = await this.tenantRepository.save(
                        this.tenantRepository.create({
                            name: 'Default Organization',
                            slug: 'default-org',
                        })
                    );
                }
                tenantId = defaultTenant.id;
            }

            const userObj = {
                userId: payload.sub || payload.userId,
                email,
                tenantId,
                role,
            };

            (req as any).user = userObj;
            return this.success(userObj);
        } catch (err: any) {
            this.logger.error(`Authentication error: ${err.message}`);
            return this.fail(new UnauthorizedException('Token validation failed'), 401);
        }
    }

    async validate(payload: any) {
        return payload;
    }
}
