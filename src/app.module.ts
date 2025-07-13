import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PaymentsModule } from '@payments/payments.module';
import { BullModule } from '@nestjs/bullmq';
import * as process from 'node:process';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { PaymentHealthCheckModule } from '@payment-health-check/payment-health-check.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisUrl: string = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv(redisUrl),
          ],
        };
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: 6379,
      },
    }),
    PaymentsModule,
    ...(process.env.RUNHEALTHCHECK === 'true'
      ? [PaymentHealthCheckModule]
      : []),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
