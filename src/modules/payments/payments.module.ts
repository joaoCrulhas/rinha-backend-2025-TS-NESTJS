import { FactoryProvider, Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import {
  CreatePaymentService,
  PaymentsSummaryService,
} from '@payments/services';
import { DataSource } from 'typeorm';
import { Payment } from '@payments/entities';
import {
  IPaymentRepository,
  PaymentRepositoryTypeormRepository,
} from '@payments/repository';
import { HttpModule } from '@nestjs/axios';
import {
  CreatePaymentController,
  PaymentsSummaryController,
} from '@payments/controllers';
import { BullModule } from '@nestjs/bullmq';
import { ProcessPaymentProcessor } from '@payments/processors';
import { RinhaPaymentProcessorAdapter } from '@payments/adapters';
import { ServerType } from '@payments/types';
import * as process from 'node:process';

const paymentRepositoryFactory: FactoryProvider = {
  inject: ['DATA_SOURCE'],
  provide: 'PAYMENT_REPOSITORY',
  useFactory(dataSource: DataSource): IPaymentRepository {
    const paymentRepository = dataSource.getRepository(Payment);
    return new PaymentRepositoryTypeormRepository(paymentRepository);
  },
};
const rinhaPaymentProcessorAdapter: FactoryProvider = {
  provide: 'PAYMENT_PROCESSOR_ADAPTER',
  useFactory: function () {
    const rinhaDefaultUrl: string = process.env
      .PAYMENT_PROCESSOR_URL_DEFAULT as string;
    const fallbackUrl: string = process.env
      .PAYMENT_PROCESSOR_URL_FALLBACK as string;
    const servers: Array<ServerType> = [
      {
        host: 'default',
        url: rinhaDefaultUrl,
      },
      {
        host: 'fallback',
        url: fallbackUrl,
      },
    ];
    return new RinhaPaymentProcessorAdapter(servers);
  },
};
@Module({
  controllers: [CreatePaymentController, PaymentsSummaryController],
  imports: [
    DatabaseModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'process-payment-queue',
      defaultJobOptions: {
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  providers: [
    paymentRepositoryFactory,
    rinhaPaymentProcessorAdapter,
    CreatePaymentService,
    PaymentsSummaryService,
    ProcessPaymentProcessor,
  ],
})
export class PaymentsModule {}
