import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreatePaymentRequestDto } from '@payments/dtos';
import { CreatePaymentService } from '@payments/services';
import { Payment } from '@payments/entities';
import { Logger } from '@nestjs/common';

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
  constructor(private readonly createPaymentService: CreatePaymentService) {
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
    const maxAttempts = job.opts.attempts || 1;
    const currentAttempt = job.attemptsMade + 1;

    this.logger.error(
      `Failed to process job ${job.id} (attempt ${currentAttempt}/${maxAttempts}): ${error.message}`,
      error.stack,
    );

    // If we have retries left, let the queue handle the retry
    if (currentAttempt < maxAttempts) {
      this.logger.warn(
        `Will retry job ${job.id} (attempt ${currentAttempt + 1}/${maxAttempts})`,
      );
      return;
    }
    try {
      await this.createPaymentService.execute(job.data, 'default');
      this.logger.log(`default processor succeeded for job ${job.id}`);
      return;
    } catch (dfError) {
      this.logger.error(
        `default processor also failed for job ${job.id}: ${dfError.message}`,
        dfError.stack,
      );
    }

    this.logger.warn(
      `All attempts failed for job ${job.id}, trying fallback...`,
    );

    try {
      await this.createPaymentService.execute(job.data, 'fallback');
      this.logger.log(`Fallback processor succeeded for job ${job.id}`);
    } catch (fallbackError) {
      this.logger.error(
        `Fallback processor also failed for job ${job.id}: ${fallbackError.message}`,
        fallbackError.stack,
      );
      await job.moveToFailed(
        new Error(
          `All attempts and fallback processor failed: ${fallbackError.message}`,
        ),
        null, // token
        false, // don't fetch the current job state
      );
    }
  }
}
