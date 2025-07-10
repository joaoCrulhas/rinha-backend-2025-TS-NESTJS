import { DataSource } from 'typeorm';
import { Payment } from '@payments/entities';

export const paymentRepositoryFactory = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
    inject: ['DATA_SOURCE'],
  },
];
