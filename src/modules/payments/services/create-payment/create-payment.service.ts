import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICreatePayment } from '@payments/protocols';
import { CreatePaymentRequestDto } from '@payments/dtos';
import { IPaymentRepository } from '@payments/repository/payment-repository.protocol';
import { Payment } from '@payments/entities';

@Injectable()
export class CreatePaymentService {
  private readonly logger = new Logger(CreatePaymentService.name);
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('PAYMENT_PROCESSOR_ADAPTER')
    private readonly createPaymentAdapter: ICreatePayment,
  ) {}

  async execute(input: CreatePaymentRequestDto): Promise<Payment> {
    this.logger.debug(`Registering payment: ${JSON.stringify(input)}`);
    await this.createPaymentAdapter.execute(input);
    return await this.paymentRepository.createPayment(
      input.correlationId,
      input.amount,
      input.requestedAt,
    );
  }
}
