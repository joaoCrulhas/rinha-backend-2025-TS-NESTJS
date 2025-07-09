import { Inject, Injectable } from '@nestjs/common';
import { IHealthCheckPaymentProcessor } from '@payment-health-check/protocols';
import {
  PaymentProcessorStatusResponse,
  RinhaHealthCheckResponseDto,
} from '@payment-health-check/dtos';

@Injectable()
export class GetPaymentProcessorStatusService {
  constructor(
    @Inject('PAYMENT_PROCESSOR_HEALTH_CHECK_ADAPTER')
    private readonly paymentProcessorHealthCheckAdapter: IHealthCheckPaymentProcessor,
  ) {}

  private _apiStatuses: PaymentProcessorStatusResponse = {
    mainProcessorStatus: new RinhaHealthCheckResponseDto(),
    fallbackProcessorStatus: new RinhaHealthCheckResponseDto(),
  };

  get apiStatuses(): PaymentProcessorStatusResponse {
    return this._apiStatuses;
  }

  async getPaymentProcessorStatus(): Promise<PaymentProcessorStatusResponse> {
    this._apiStatuses =
      await this.paymentProcessorHealthCheckAdapter.checkHealth();
    return this._apiStatuses;
  }
}
