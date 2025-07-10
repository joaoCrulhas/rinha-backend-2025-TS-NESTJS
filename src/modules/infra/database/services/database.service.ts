import { DataSource } from 'typeorm';
import { Payment } from '@payments/entities';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import * as path from 'node:path';

const sqlConnectionOptions: SqliteConnectionOptions = {
  database: path.join(__dirname, 'database.sqlite'),
  entities: [Payment],
  logging: true,
  synchronize: true,
  type: 'sqlite',
};

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource(sqlConnectionOptions);
      return dataSource.initialize();
    },
  },
];
