import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, map } from 'rxjs';

@Injectable()
export class UsersInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UsersInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const requestId = Buffer.from(new Date().toISOString()).toString('base64');
    const startTime = Date.now();

    // log request
    this.logger.log(
      `(${requestId}) ${req.method} ${req.path} ${JSON.stringify(req.body)}`,
    );

    return next.handle().pipe(
      map((value) => {
        // Log successful response
        const executionTime = Date.now() - startTime;
        this.logger.log(
          `(${requestId}) ${res.statusCode} ${JSON.stringify(
            value,
          )} ${executionTime}ms`,
        );
        return value;
      }),
      catchError((error) => {
        // Log error
        this.logger.error(`(${requestId}) ${error}`);
        throw error; // Re-throw the error
      }),
    );
  }
}
