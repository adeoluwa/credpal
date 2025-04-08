import { DataSourceOptions } from 'typeorm';
import path from 'path';

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'fx_user',
  password: process.env.DB_PASSWORD || 'securepassword',
  database: process.env.DB_NAME || 'fx_trading',
  entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV !== 'production',
  migrationsTableName: 'migrations',
  migrationsRun: true, // auto-run migrations on startup
  extra: {
    connectionLimit: 5,
  },
};

export default config;
