export class CreatePaymentRequestDto {
  correlationId: string;
  amount: number;
  requestedAt: Date;
  constructor(correlationId: string, amount: number, requestedAt: Date) {
    this.correlationId = correlationId;
    this.amount = amount;
    this.requestedAt = requestedAt;
  }
}
