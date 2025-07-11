import { IHealthCheckPaymentProcessor } from '@payment-health-check/protocols';
import { Logger } from '@nestjs/common';
import {
  PaymentProcessorStatusResponse,
  RinhaHealthCheckResponseDto,
} from '@payment-health-check/dtos';
import axios from 'axios';

export class RinhaPaymentProcessorHealthCheckAdapter
  implements IHealthCheckPaymentProcessor
{
  private readonly logger = new Logger(
    RinhaPaymentProcessorHealthCheckAdapter.name,
  );

  constructor(
    private readonly paymentProcessorHealthCheckUrlMain: string,
    private readonly paymentProcessorHealthCheckUrlFallback: string,
  ) {}

  async checkHealth(): Promise<PaymentProcessorStatusResponse> {
    try {
      const responseDefaultServer =
        await axios.get<RinhaHealthCheckResponseDto>(
          this.paymentProcessorHealthCheckUrlMain,
        );
      const responseFallbackServer =
        await axios.get<RinhaHealthCheckResponseDto>(
          this.paymentProcessorHealthCheckUrlFallback,
        );
      this.logger.debug(
        `Main processor status: ${JSON.stringify(responseDefaultServer.data)}`,
      );
      this.logger.debug(
        `Fallback processor status: ${JSON.stringify(responseFallbackServer.data)}`,
      );
      return {
        mainProcessorStatus: responseDefaultServer.data,
        fallbackProcessorStatus: responseFallbackServer.data,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
