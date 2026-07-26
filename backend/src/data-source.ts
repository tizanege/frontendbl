import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = databaseUrl
    ? new DataSource({
          type: 'postgres',
          url: databaseUrl,
          ssl: { rejectUnauthorized: false },
          entities: [join(__dirname, '**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
          synchronize: false,
          logging: true,
      })
    : new DataSource({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT || '5432'),
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASS,
          database: process.env.DATABASE_NAME,
          entities: [join(__dirname, '**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
          synchronize: false,
          logging: true,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false, servername: process.env.DATABASE_HOST } as any : false,
      });
