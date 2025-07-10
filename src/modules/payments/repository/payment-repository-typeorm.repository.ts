import { IPaymentRepository } from '@payments/repository';
import { Repository } from 'typeorm';
import { Payment } from '@payments/entities';

export class PaymentRepositoryTypeormRepository implements IPaymentRepository {
  constructor(private paymentRepository: Repository<Payment>) {}

  async createPayment(
    correlationId: string,
    amount: number,
    requestedAt: Date,
  ): Promise<Payment> {
    const paymentCreated = await this.paymentRepository.save({
      correlationId,
      amount,
      requestedAt,
    });
    return new Payment(
      paymentCreated.correlationId,
      paymentCreated.amount,
      paymentCreated.requestedAt,
    );
  }
}
