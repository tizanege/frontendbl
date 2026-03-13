import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_URL ? undefined : process.env.DATABASE_HOST,
    port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_URL ? undefined : process.env.DATABASE_USER,
    password: process.env.DATABASE_URL ? undefined : process.env.DATABASE_PASS,
    database: process.env.DATABASE_URL ? undefined : process.env.DATABASE_NAME,
    entities: [join(__dirname, '**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: true,
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
});
