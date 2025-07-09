import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GetPaymentProcessorStatusService } from '@payment-health-check/services';

const everyFiveSeconds: string = '*/5 * * * * *';
@Injectable()
export class PaymentHealthCheckCronService {
  private readonly logger = new Logger(PaymentHealthCheckCronService.name);
  constructor(
    @Inject('GET_PAYMENT_PROCESSOR_STATUS_SERVICE')
    private readonly getPaymentProcessorStatusService: GetPaymentProcessorStatusService,
  ) {}

  @Cron(everyFiveSeconds)
  async checkHealth() {
    this.logger.debug('Checking payment health');
    const paymentProcessorStatus =
      await this.getPaymentProcessorStatusService.getPaymentProcessorStatus();
    this.logger.debug(JSON.stringify(paymentProcessorStatus));
  }
}
