import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreatePaymentRequestDto } from '@payments/dtos';
import { CreatePaymentService } from '@payments/services';
import { Payment } from '@payments/entities';
import { Logger } from '@nestjs/common';

@Processor('process-payment-queue')
export class ProcessPaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(ProcessPaymentProcessor.name);
  constructor(private readonly createPaymentService: CreatePaymentService) {
    super();
  }
  async process(
    job: Job<CreatePaymentRequestDto, Payment, string>,
  ): Promise<any> {
    this.logger.debug(`Processing payment: ${JSON.stringify(job.data)}`);
    return await this.createPaymentService.execute(job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
