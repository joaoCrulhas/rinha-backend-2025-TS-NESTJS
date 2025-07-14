import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreatePaymentRequestDto } from '@payments/dtos';
import { CreatePaymentService } from '@payments/services';
import { Payment } from '@payments/entities';
import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Processor('process-payment-queue', {
  concurrency: 10,
  limiter: {
    max: 100,
    duration: 1000,
  },
})
// mainProcessorStatus
// fallbackProcessorStatus
export class ProcessPaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(ProcessPaymentProcessor.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly createPaymentService: CreatePaymentService,
  ) {
    super();
  }
  async process(job: Job<CreatePaymentRequestDto, Payment>): Promise<any> {
    this.logger.debug(
      `Starting to process payment: ${JSON.stringify(job.data)}`,
    );
    try {
      return await this.createPaymentService.execute(job.data, 'default');
    } catch (error) {
      this.logger.error(
        `Error to process payment[host='default']: ${JSON.stringify(job.data)}, ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CreatePaymentRequestDto, Payment>) {
    this.logger.log(`Payment processed: ${JSON.stringify(job.returnvalue)}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<CreatePaymentRequestDto, Payment>, error: Error) {
    this.logger.error(
      `Error to process the job ID: ${job.id}): ${error.message}`,
      error.stack,
    );

    if (job.attemptsMade < (job.opts.attempts || 1)) {
      this.logger.warn(
        `Retrying (attempts ${job.attemptsMade + 1}/${job.opts.attempts || 1}): ${job.id}`,
      );
      return;
    }

    this.logger.warn(`No more attempts left, moving job to failed: ${job.id}`);
    try {
      const isMainProcessorFailing = await this.cacheManager.get<boolean>(
        'mainProcessorStatus',
      );

      if (isMainProcessorFailing) {
        this.logger.log(
          `Main processor is failing. Attempting with 'fallback' service for job ${job.id}.`,
        );
        await this.createPaymentService.execute(job.data, 'fallback');
      } else {
        this.logger.log(
          `All retries exhausted. Attempting with 'fallback' service for job ${job.id}.`,
        );
        await this.createPaymentService.execute(job.data, 'fallback');
      }
    } catch (fallbackError) {
      await job.moveToFailed(
        new Error('Error to process payment.'),
        null,
        false,
      );
      throw fallbackError;
    }
  }
}
