import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
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
