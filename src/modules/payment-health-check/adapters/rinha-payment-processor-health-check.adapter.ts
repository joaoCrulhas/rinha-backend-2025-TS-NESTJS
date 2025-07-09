import { IHealthCheckPaymentProcessor } from '@payment-health-check/protocols';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';
import {
  PaymentProcessorStatusResponse,
  RinhaHealthCheckResponseDto,
} from '@payment-health-check/dtos';

export class RinhaPaymentProcessorHealthCheckAdapter
  implements IHealthCheckPaymentProcessor
{
  private readonly logger = new Logger(
    RinhaPaymentProcessorHealthCheckAdapter.name,
  );

  constructor(
    private readonly httpService: HttpService,
    private readonly paymentProcessorHealthCheckUrlMain: string,
    private readonly paymentProcessorHealthCheckUrlFallback: string,
  ) {}

  async checkHealth(): Promise<PaymentProcessorStatusResponse> {
    try {
      const fetchMainProcessorStatus =
        this.httpService.get<RinhaHealthCheckResponseDto>(
          this.paymentProcessorHealthCheckUrlMain,
        );
      const fetchFallbackProcessorStatus =
        this.httpService.get<RinhaHealthCheckResponseDto>(
          this.paymentProcessorHealthCheckUrlFallback,
        );
      const { data: mainProcessorStatus } = await lastValueFrom(
        fetchMainProcessorStatus,
      );
      const { data: fallbackProcessorStatus } = await lastValueFrom(
        fetchFallbackProcessorStatus,
      );
      this.logger.debug(
        `Main processor status: ${JSON.stringify(mainProcessorStatus)}`,
      );
      this.logger.debug(
        `Fallback processor status: ${JSON.stringify(fallbackProcessorStatus)}`,
      );
      return {
        mainProcessorStatus,
        fallbackProcessorStatus,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
