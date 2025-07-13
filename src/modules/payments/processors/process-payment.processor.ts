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
  async process(job: Job<CreatePaymentRequestDto, Payment>): Promise<any> {
    this.logger.debug(`Processing payment: ${JSON.stringify(job.data)}`);
    return await this.createPaymentService.execute(job.data, 'default');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CreatePaymentRequestDto, Payment>) {
    this.logger.log(`Payment processed: ${JSON.stringify(job.returnvalue)}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<CreatePaymentRequestDto, Payment>) {
    this.logger.log(`Processing payment: ${JSON.stringify(job.data)}`);
    try {
      this.logger.log(`Retrying payment: ${JSON.stringify(job.data)}`);
      await this.createPaymentService.execute(job.data, 'default');
    } catch (error: any) {
      this.logger.error(
        `Retrying payment: ${JSON.stringify(error)} with fallback`,
      );
      await this.createPaymentService.execute(job.data, 'fallback');
    }
  }
}
