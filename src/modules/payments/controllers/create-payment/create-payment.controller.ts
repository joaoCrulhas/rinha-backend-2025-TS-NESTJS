import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreatePaymentRequestDto } from '@payments/dtos';
import { CreatePaymentService } from '@payments/services';
import { Payment } from '@payments/entities';

@Controller('payments')
export class CreatePaymentController {
  constructor(private readonly createPaymentService: CreatePaymentService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreatePaymentRequestDto): Promise<Payment> {
    return await this.createPaymentService.execute(input);
  }
}
