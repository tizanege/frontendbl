import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BillingModule } from './billing/billing.module';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';
import { UsersModule } from './users/users.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASS'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true, // Only for development
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BillingModule,
    AuthModule,
    FormsModule,
    UsersModule,
    DispatchModule,
    CommonModule,
  ],
})
export class AppModule { }
