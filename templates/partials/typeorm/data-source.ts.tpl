import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: '__TYPEORM_PROVIDER__',
  url: process.env['DATABASE_URL'],
  synchronize: process.env['NODE_ENV'] === 'development',
  logging: process.env['NODE_ENV'] === 'development',
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/migrations/**/*.ts'],
});
