// all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.error(`Erro ${status} na rota ${request.url}:`, exception); // Logar o erro

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Ocorreu um erro interno no servidor.', // Mensagem genérica para o cliente
    });
    // super.catch(exception, host); // Se quiser que o NestJS trate erros conhecidos de forma padrão
  }
}
