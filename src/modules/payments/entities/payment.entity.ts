import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryColumn()
  correlationId: string;

  @Column('float')
  amount: number;

  @Column('date')
  requestedAt: Date;

  constructor(correlationId: string, amount: number, requestedAt: Date) {
    this.correlationId = correlationId;
    this.amount = amount;
    this.requestedAt = requestedAt;
  }
}
