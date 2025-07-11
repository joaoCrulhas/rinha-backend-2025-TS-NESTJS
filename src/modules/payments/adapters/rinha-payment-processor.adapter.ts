import {
  CreatePaymentRequestDto,
  CreatePaymentResponseDto,
} from '@payments/dtos';
import { ICreatePayment } from '@payments/protocols';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { Host, ServerType } from '@payments/types';

export class RinhaPaymentProcessorAdapter implements ICreatePayment {
  private logger = new Logger(RinhaPaymentProcessorAdapter.name);
  private readonly servers: Array<ServerType> = [];

  constructor(servers: Array<ServerType>) {
    this.servers = servers;
  }

  async execute(
    input: CreatePaymentRequestDto,
    host: Host = 'default',
  ): Promise<CreatePaymentResponseDto> {
    try {
      this.logger.log(
        `Processing payment: ${JSON.stringify(input)}, host: ${host}`,
        {
          host,
        },
      );
      const response = await axios.post<CreatePaymentResponseDto>(
        this.getHostUrl(host) + '/payments',
        input,
      );
      return {
        ...response.data,
        source: host,
      };
    } catch (e) {
      this.logger.error('Error in main payment processor');
      this.logger.error(e);
      throw e;
    }
  }

  private getHostUrl(host: Host): string {
    const server = this.servers.find((s) => s.host === host);
    if (!server) {
      throw new Error('Server not found');
    }
    return server.url;
  }
}
