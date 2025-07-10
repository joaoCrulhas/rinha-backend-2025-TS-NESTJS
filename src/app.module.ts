import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentHealthCheckModule } from '@payment-health-check/payment-health-check.module';
import { PaymentsModule } from '@payments/payments.module';

@Module({
  imports: [PaymentsModule, PaymentHealthCheckModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
