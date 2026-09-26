import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

type HttpResponse = {
  status: (status: number) => HttpResponse;
  json: (body: unknown) => HttpResponse;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (this.isApiError(body)) {
        return response.status(status).json(body);
      }
      return response.status(status).json({
        error: { code: 'VALIDATION_ERROR', message: this.message(body) },
      });
    }
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    });
  }

  private isApiError(body: string | object): body is { error: { code: string; message: string } } {
    if (typeof body !== 'object' || body === null || !('error' in body)) {
      return false;
    }
    const error = (body as { error?: unknown }).error;
    return typeof error === 'object'
      && error !== null
      && typeof (error as { code?: unknown }).code === 'string'
      && typeof (error as { message?: unknown }).message === 'string';
  }

  private message(body: string | object) {
    if (typeof body === 'string') {
      return body;
    }
    const value = body as { message?: string | string[] };
    return Array.isArray(value.message) ? value.message.join(', ') : value.message || 'Invalid request.';
  }
}
