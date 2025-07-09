import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentHealthCheckModule } from '@payment-health-check/payment-health-check.module';

@Module({
  imports: [PaymentHealthCheckModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
