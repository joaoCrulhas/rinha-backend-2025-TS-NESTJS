import {
  CreatePaymentRequestDto,
  CreatePaymentResponseDto,
} from '@payments/dtos';

export interface ICreatePayment {
  execute(input: CreatePaymentRequestDto): Promise<CreatePaymentResponseDto>;
}
