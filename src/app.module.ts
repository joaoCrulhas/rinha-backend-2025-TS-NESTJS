import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentHealthCheckModule } from '@payment-health-check/payment-health-check.module';
import { PaymentsModule } from '@payments/payments.module';
import { BullModule } from '@nestjs/bullmq';
import * as process from 'node:process';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: 6379,
      },
    }),
    PaymentsModule,
    PaymentHealthCheckModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
