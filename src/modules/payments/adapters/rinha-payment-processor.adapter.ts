import {
  CreatePaymentRequestDto,
  CreatePaymentResponseDto,
} from '@payments/dtos';
import { ICreatePayment } from '@payments/protocols';
import axios from 'axios';
import { Logger } from '@nestjs/common';

export class RinhaPaymentProcessorAdapter implements ICreatePayment {
  private logger = new Logger(RinhaPaymentProcessorAdapter.name);
  private urlMain = 'http://localhost:8001/payments';
  private urlFallback = 'http://localhost:8002/payments';
  async execute(
    input: CreatePaymentRequestDto,
  ): Promise<CreatePaymentResponseDto> {
    try {
      const response = await axios.post<CreatePaymentResponseDto>(
        this.urlMain,
        input,
      );
      return response.data;
    } catch (e) {
      this.logger.error('Error in main payment processor');
      this.logger.error(e);
      try {
        const response = await axios.post<CreatePaymentResponseDto>(
          this.urlFallback,
          input,
        );
        return response.data;
      } catch (e) {
        this.logger.error(e);
        this.logger.error('Error in fallback payment processor');
        throw e;
      }
    }
  }
}
