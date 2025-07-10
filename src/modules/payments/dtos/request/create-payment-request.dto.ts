import { IsDate, IsNumber, IsUUID } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsUUID()
  correlationId: string;
  @IsNumber()
  amount: number;
  @IsDate()
  requestedAt: Date;
  constructor(correlationId: string, amount: number, requestedAt: Date) {
    this.correlationId = correlationId;
    this.amount = amount;
    this.requestedAt = requestedAt;
  }
}
