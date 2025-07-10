import { DataSource } from 'typeorm';
import { Payment } from '@payments/entities';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

const sqlConnectionOptions: SqliteConnectionOptions = {
  database: './database.sqlite',
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
