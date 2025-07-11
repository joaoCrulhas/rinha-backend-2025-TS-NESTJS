import { IPaymentRepository } from '@payments/repository';
import { Repository } from 'typeorm';
import { Payment } from '@payments/entities';

export class PaymentRepositoryTypeormRepository implements IPaymentRepository {
  constructor(private paymentRepository: Repository<Payment>) {}

  async createPayment(
    correlationId: string,
    amount: number,
    requestedAt: Date,
    source: string,
  ): Promise<Payment> {
    const paymentCreated = await this.paymentRepository.save({
      correlationId,
      amount,
      requestedAt,
      source,
    });

    return new Payment(
      paymentCreated.correlationId,
      paymentCreated.amount,
      paymentCreated.requestedAt,
    );
  }

  async getPaymentsSummary(
    source: string,
    to?: Date,
    from?: Date,
  ): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');
    queryBuilder.andWhere('payment.source = :source', { source });
    if (from) {
      queryBuilder.andWhere('payment.requestedAt >= :from', { from });
    }
    if (to) {
      queryBuilder.andWhere('payment.requestedAt <= :to', { to });
    }
    return await queryBuilder.getMany();
  }
}
