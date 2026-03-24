import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'object' && exResponse !== null) {
        const res = exResponse as Record<string, unknown>;
        errorCode = (res.error as string) || 'UNKNOWN_ERROR';
        message = Array.isArray(res.message)
          ? res.message.join(', ')
          : (res.message as string) || exception.message;
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message,
      },
      statusCode: status,
    });
  }
}
