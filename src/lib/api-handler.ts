import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError, AppError } from '@/lib/error';

type ApiHandler<T> = (req: NextRequest, params: any, parsedBody?: T) => Promise<NextResponse>;

type ValidationSchema<T> = z.Schema<T>;

export function withValidation<T>(handler: ApiHandler<T>, schema?: ValidationSchema<T>) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      let parsedData: T | undefined;

      if (schema) {
        if (req.method === 'GET') {
          // Validate search params for GET requests
          const url = new URL(req.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          const result = schema.safeParse(queryParams);

          if (!result.success) {
            return NextResponse.json(
              {
                error: {
                  message: 'Validation Error',
                  code: 'VALIDATION_ERROR',
                  details: result.error.format(),
                },
              },
              { status: 400 }
            );
          }
          parsedData = result.data;
        } else {
          // Validate JSON body for other requests
          const body = await req.json();
          const result = schema.safeParse(body);

          if (!result.success) {
            return NextResponse.json(
              {
                error: {
                  message: 'Validation Error',
                  code: 'VALIDATION_ERROR',
                  details: result.error.format(),
                },
              },
              { status: 400 }
            );
          }
          parsedData = result.data;
        }
      }

      return await handler(req, params, parsedData);
    } catch (error) {
      logError(error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
            },
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          error: {
            message: 'Internal Server Error',
            code: 'INTERNAL_SERVER_ERROR',
          },
        },
        { status: 500 }
      );
    }
  };
}
