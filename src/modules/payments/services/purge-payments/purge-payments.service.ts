import { Inject, Injectable } from '@nestjs/common';
import { IPaymentsPurge } from '@payments/protocols';

@Injectable()
export class PurgePaymentsService {
  constructor(
    @Inject('PAYMENT_PROCESSOR_ADAPTER')
    private readonly purgePaymentProcessor: IPaymentsPurge,
  ) {}
  async purge() {
    await this.purgePaymentProcessor.purge();
  }
}
