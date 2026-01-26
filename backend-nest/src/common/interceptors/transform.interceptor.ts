import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '../dto/response.dto';

interface ResponseData {
  data?: unknown;
  message?: string;
  pagination?: unknown;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: ResponseData | T) => {
        const responseData = data as ResponseData;
        const hasNestedData =
          responseData &&
          typeof responseData === 'object' &&
          'data' in responseData;

        return {
          success: true,
          data: hasNestedData ? (responseData.data as T) : (data as T),
          message: responseData?.message,
          pagination: responseData?.pagination,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            version: 'v2.0',
          },
        } as ApiResponse<T>;
      }),
    );
  }
}
