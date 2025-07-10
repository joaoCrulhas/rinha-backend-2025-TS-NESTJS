import { Payment } from '@payments/entities';

export interface IPaymentRepository {
  createPayment(
    correlationId: string,
    amount: number,
    requestedAt: Date,
  ): Promise<Payment>;
}
