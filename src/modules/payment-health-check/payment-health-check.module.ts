import { FactoryProvider, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  GetPaymentProcessorStatusService,
  PaymentHealthCheckCronService,
} from '@payment-health-check/services';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RinhaPaymentProcessorHealthCheckAdapter } from '@payment-health-check/adapters/rinha-payment-processor-health-check.adapter';

const getPaymentProcessorFactory: FactoryProvider = {
  provide: 'GET_PAYMENT_PROCESSOR_STATUS_SERVICE',
  inject: [HttpService],
  useFactory: function (httpService: HttpService) {
    // Todo: Replace to use the config service.
    const paymentProcessorHealthCheckUrlMain =
      'http://localhost:8001/payments/service-health';
    // Todo: Replace to use the config service.
    const paymentProcessorHealthCheckUrlFallback =
      'http://localhost:8002/payments/service-health';
    const rinhaHealthCheckAdapter = new RinhaPaymentProcessorHealthCheckAdapter(
      httpService,
      paymentProcessorHealthCheckUrlMain,
      paymentProcessorHealthCheckUrlFallback,
    );
    return new GetPaymentProcessorStatusService(rinhaHealthCheckAdapter);
  },
};
/*
 * This module is used to check the health of the payment service.
 * The payment processors, this will handle the health check for all services and fallback services
 * To handle the health check status, we will use a background job, which will be responsible for constantly ping the
 * payment processors health endpoints.
 *
 * */
@Module({
  imports: [ScheduleModule.forRoot(), HttpModule],
  providers: [getPaymentProcessorFactory, PaymentHealthCheckCronService],
})
export class PaymentHealthCheckModule {}
