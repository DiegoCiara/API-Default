import { ConnectionOptions } from 'typeorm';

// Check typeORM documentation for more information.
const config: ConnectionOptions = {
  type: 'postgres',
  port: Number(process.env.DB_PORT),
  synchronize: true,
  migrationsRun: true, // se precisar rodar novas migrations;
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: ['./src/app/entities/*.ts'],
  migrations: ['./src/database/migrations/*.ts'],
  cli: {
    migrationsDir: './src/database/migrations',
    entitiesDir: './src/app/entities',
  },
};

export = config;
